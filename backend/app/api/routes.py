import csv, io
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.models import AuditFinding, ControlTest, Dataset, User
from app.schemas.schemas import DashboardSummary, DatasetOut, FindingOut, Token, UserCreate
from app.services.audit_engine import evaluate

router = APIRouter()
@router.post("/auth/register", response_model=Token, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email)): raise HTTPException(409, "Email already registered")
    user = User(email=payload.email, hashed_password=hash_password(payload.password)); db.add(user); db.commit()
    return {"access_token": create_access_token(user.email)}
@router.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == form.username))
    if not user or not verify_password(form.password, user.hashed_password): raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_access_token(user.email)}
@router.get("/datasets", response_model=list[DatasetOut])
def list_datasets(db: Session = Depends(get_db)): return db.scalars(select(Dataset).order_by(Dataset.uploaded_at.desc())).all()
@router.post("/datasets/upload", response_model=DatasetOut, status_code=201)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"): raise HTTPException(400, "Upload a CSV file")
    try: rows = list(csv.DictReader(io.StringIO((await file.read()).decode("utf-8-sig"))))
    except UnicodeDecodeError: raise HTTPException(400, "CSV must be UTF-8 encoded")
    dataset = Dataset(name=file.filename, description="Uploaded audit data", row_count=len(rows), data=rows); db.add(dataset); db.commit(); db.refresh(dataset); return dataset
@router.get("/datasets/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset: raise HTTPException(404, "Dataset not found")
    return dataset
@router.post("/audit/run/{dataset_id}", response_model=list[FindingOut])
def run_audit(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset: raise HTTPException(404, "Dataset not found")
    for old in [*dataset.findings, *dataset.tests]: db.delete(old)
    findings, tests = evaluate(dataset.data)
    db.add_all([AuditFinding(dataset_id=dataset.id, **item) for item in findings]); db.add_all([ControlTest(dataset_id=dataset.id, **item) for item in tests]); db.commit()
    return db.scalars(select(AuditFinding).where(AuditFinding.dataset_id == dataset_id)).all()
@router.get("/findings", response_model=list[FindingOut])
def list_findings(db: Session = Depends(get_db)): return db.scalars(select(AuditFinding).order_by(AuditFinding.created_at.desc())).all()
@router.get("/findings/{finding_id}", response_model=FindingOut)
def get_finding(finding_id: int, db: Session = Depends(get_db)):
    item = db.get(AuditFinding, finding_id)
    if not item: raise HTTPException(404, "Finding not found")
    return item
@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard(db: Session = Depends(get_db)):
    findings = db.scalars(select(AuditFinding).order_by(AuditFinding.created_at.desc())).all(); tests = db.scalars(select(ControlTest)).all()
    return {"total_datasets": db.scalar(select(func.count()).select_from(Dataset)) or 0, "total_findings": len(findings), "severity_breakdown": {s: sum(f.severity == s for f in findings) for s in ["Critical","High","Medium","Low"]}, "control_pass_percentage": round(100 * sum(t.passed for t in tests) / len(tests), 1) if tests else 0, "recent_findings": findings[:10]}

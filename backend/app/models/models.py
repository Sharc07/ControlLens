from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    data: Mapped[list] = mapped_column(JSON, default=list)
    findings: Mapped[list["AuditFinding"]] = relationship(back_populates="dataset", cascade="all, delete-orphan")
    tests: Mapped[list["ControlTest"]] = relationship(back_populates="dataset", cascade="all, delete-orphan")

class AuditFinding(Base):
    __tablename__ = "audit_findings"
    id: Mapped[int] = mapped_column(primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), index=True)
    rule_name: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(32))
    description: Mapped[str] = mapped_column(Text)
    affected_rows: Mapped[int] = mapped_column(Integer)
    recommendation: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="Open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    dataset: Mapped[Dataset] = relationship(back_populates="findings")

class ControlTest(Base):
    __tablename__ = "control_tests"
    id: Mapped[int] = mapped_column(primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"), index=True)
    control_name: Mapped[str] = mapped_column(String(255))
    result: Mapped[str] = mapped_column(Text)
    passed: Mapped[bool] = mapped_column(Boolean)
    execution_time: Mapped[int] = mapped_column(Integer)
    dataset: Mapped[Dataset] = relationship(back_populates="tests")

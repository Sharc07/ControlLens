from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserCreate(BaseModel): email: EmailStr; password: str = Field(min_length=8)
class Token(BaseModel): access_token: str; token_type: str = "bearer"
class DatasetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; name: str; description: str | None; uploaded_at: datetime; row_count: int
class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; dataset_id: int; rule_name: str; severity: str; description: str; affected_rows: int; recommendation: str; status: str; created_at: datetime
class DashboardSummary(BaseModel):
    total_datasets: int; total_findings: int; severity_breakdown: dict[str, int]; control_pass_percentage: float; recent_findings: list[FindingOut]

from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext
from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str: return pwd_context.hash(password)
def verify_password(password: str, value: str) -> bool: return pwd_context.verify(password, value)
def create_access_token(subject: str) -> str:
    s = get_settings(); expires = datetime.now(timezone.utc) + timedelta(minutes=s.access_token_expire_minutes)
    return jwt.encode({"sub": subject, "exp": expires}, s.secret_key, algorithm="HS256")

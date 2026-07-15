"""initial schema

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa
revision = "0001"; down_revision = None; branch_labels = None; depends_on = None
def upgrade():
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("email", sa.String(320), nullable=False, unique=True), sa.Column("hashed_password", sa.String(255), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_table("datasets", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("description", sa.Text()), sa.Column("uploaded_at", sa.DateTime(), nullable=False), sa.Column("row_count", sa.Integer(), nullable=False), sa.Column("data", sa.JSON(), nullable=False))
    for table in ["audit_findings", "control_tests"]: pass
    op.create_table("audit_findings", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("datasets.id"), nullable=False), sa.Column("rule_name", sa.String(255), nullable=False), sa.Column("severity", sa.String(32), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("affected_rows", sa.Integer(), nullable=False), sa.Column("recommendation", sa.Text(), nullable=False), sa.Column("status", sa.String(32), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False))
    op.create_table("control_tests", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("datasets.id"), nullable=False), sa.Column("control_name", sa.String(255), nullable=False), sa.Column("result", sa.Text(), nullable=False), sa.Column("passed", sa.Boolean(), nullable=False), sa.Column("execution_time", sa.Integer(), nullable=False))
def downgrade():
    op.drop_table("control_tests"); op.drop_table("audit_findings"); op.drop_table("datasets"); op.drop_table("users")

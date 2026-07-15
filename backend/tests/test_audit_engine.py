from app.services.audit_engine import evaluate

def test_audit_engine_finds_duplicate_and_unapproved_large_payment():
    rows = [
        {"transaction_id": "TX-1", "amount": "12000", "approval_status": "Pending"},
        {"transaction_id": "TX-1", "amount": "100", "approval_status": "Approved"},
    ]
    findings, tests = evaluate(rows)
    assert {item["rule_name"] for item in findings} >= {"Duplicate Transaction Detection", "Approval Compliance Check"}
    assert len(tests) == 5

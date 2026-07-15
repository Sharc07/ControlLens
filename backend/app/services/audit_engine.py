from collections import Counter
from time import perf_counter
import numpy as np

def evaluate(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    findings, tests = [], []
    def control(name, matches, severity, description, recommendation):
        findings.append({"rule_name": name, "severity": severity, "description": description, "affected_rows": len(matches), "recommendation": recommendation}) if matches else None
        tests.append({"control_name": name, "result": f"{len(matches)} exception(s)", "passed": not bool(matches), "execution_time": 0})
    start = perf_counter()
    ids = Counter(str(r.get("transaction_id", "")) for r in rows if r.get("transaction_id"))
    duplicates = [r for r in rows if ids.get(str(r.get("transaction_id")), 0) > 1]
    control("Duplicate Transaction Detection", duplicates, "High", "Repeated transaction IDs or identical transaction records were detected.", "Investigate and reverse duplicate payments; enforce unique transaction identifiers.")
    no_approval = [r for r in rows if float(r.get("amount") or 0) >= 10000 and str(r.get("approval_status", "")).lower() not in {"approved", "yes"}]
    control("Approval Compliance Check", no_approval, "Critical", "High-value transactions are missing a documented approval.", "Obtain retrospective approval and enforce approval workflow controls.")
    amounts = np.array([float(r.get("amount") or 0) for r in rows])
    threshold = float(amounts.mean() + 3 * amounts.std()) if len(amounts) else 0
    outliers = [r for r in rows if float(r.get("amount") or 0) > threshold and threshold > 0]
    control("Outlier Detection", outliers, "Medium", "Transaction amounts exceed the statistical three-sigma threshold.", "Review unusual transactions and configure proactive spend monitoring.")
    vendor_risk = [r for r in rows if float(r.get("risk_score") or 0) >= 80]
    control("Vendor Risk Detection", vendor_risk, "High", "High-risk vendors require enhanced due diligence.", "Perform vendor due diligence and restrict payment activity pending review.")
    invalid_manager = [r for r in rows if r.get("employee_id") and r.get("manager_id") == r.get("employee_id")]
    control("Employee Access/Relationship Validation", invalid_manager, "Medium", "Invalid employee-manager relationships were found.", "Correct reporting relationships and validate identity-source controls.")
    elapsed = int((perf_counter() - start) * 1000)
    for test in tests: test["execution_time"] = elapsed
    return findings, tests

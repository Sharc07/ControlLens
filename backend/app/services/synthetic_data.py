from datetime import date, timedelta
from faker import Faker
import numpy as np
import pandas as pd

def generate_transactions(count: int = 250, seed: int = 42) -> pd.DataFrame:
    fake, rng = Faker(), np.random.default_rng(seed); Faker.seed(seed)
    rows=[]
    for i in range(count):
        rows.append({"transaction_id": f"TX-{100000+i}", "employee_id": f"EMP-{rng.integers(1000, 1100)}", "vendor": fake.company(), "amount": round(float(rng.lognormal(7.5, .7)), 2), "date": str(date.today()-timedelta(int(rng.integers(1,365)))), "department": rng.choice(["Finance","Operations","IT","Procurement"]), "approval_status": rng.choice(["Approved","Approved","Pending"])})
    rows[1] = {**rows[0]}; rows[2]["amount"] = 55000; rows[2]["approval_status"] = "Pending"
    return pd.DataFrame(rows)

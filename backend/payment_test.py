import pandas as pd
import requests

# =========================
# CONFIGURATION
# =========================
BASE_URL = "http://localhost:8000/api"
ENDPOINT = f"{BASE_URL}/payments/record/"
HEADERS = {"Content-Type": "application/json"}

EXCEL_PATH = "./paid but not updated.xlsx"

# Common values for ALL records
COMMON_DATA = {
    "amount": 1200,
    "paymentAmount": 1200,
    "paymentMethod": "UPI",
    "paymentStatus": "completed",
    "discountApplied": 0,
    "couponCode": "",
    "applicationStatus": "payment_completed"
}

# =========================
# READ EXCEL
# =========================
df = pd.read_excel(EXCEL_PATH)

required_columns = {"transactionId", "phone", "paymentDate"}
missing = required_columns - set(df.columns)

if missing:
    raise ValueError(f"Missing required columns in Excel: {missing}")

# =========================
# INSERT RECORDS
# =========================
success = 0
failed = 0

for idx, row in df.iterrows():
    payload = {
        **COMMON_DATA,
        "transactionId": str(row["transactionId"]),
        "paymentDate": (
            row["paymentDate"].strftime("%Y-%m-%d %H:%M:%S")
            if hasattr(row["paymentDate"], "strftime")
            else str(row["paymentDate"])
        ),
        "phone": str(row["phone"]),
        "user_id": str(row["phone"]),            # same as phone
        "session_id": f"pending-{row['phone']}"  # derived field
    }

    try:
        response = requests.post(
            ENDPOINT,
            json=payload,
            headers=HEADERS,
            timeout=10
        )

        if response.status_code in (200, 201):
            success += 1
            print(f"✅ Row {idx + 1} inserted | TXN={payload['transactionId']}")
        else:
            failed += 1
            print(f"❌ Row {idx + 1} failed | Status={response.status_code}")
            print(response.text)

    except Exception as e:
        failed += 1
        print(f"🔥 Row {idx + 1} exception: {e}")

# =========================
# SUMMARY
# =========================
print("\n===== SUMMARY =====")
print("Inserted :", success)
print("Failed   :", failed)

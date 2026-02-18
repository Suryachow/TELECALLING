"""
Generate Sample Payment Gateway Excel File for Testing
This script creates a sample Excel file with all required columns for payment gateway upload
"""

import pandas as pd
from datetime import datetime, timedelta
import random

def generate_sample_payments(num_records=10):
    """Generate sample payment records"""
    
    # Define all required columns
    columns = [
        'status', 'txnid', 'addedon', 'id', 'amount', 'productinfo', 'firstname', 
        'email', 'phone', 'ip', 'merchant_id', 'bank_name', 'bank_ref_no', 
        'cardtype', 'mode', 'error_code', 'errorDescription', 'error_message', 
        'pgmid', 'pg_response', 'issuing_bank', 'payment_source', 'name_on_card', 
        'card_number', 'address_line1', 'address_line2', 'state', 'country', 
        'zipcode', 'shipping_firstname', 'shipping_lastname', 'shipping_address1', 
        'shipping_address2', 'shipping_city', 'shipping_state', 'shipping_country', 
        'shipping_zipcode', 'shipping_phone', 'transaction_fee', 'discount', 
        'additional_charges', 'amount(inr)', 'udf1', 'udf2', 'udf3', 'udf4', 
        'udf5', 'field0', 'field1', 'field2', 'field3', 'field4', 'field5', 
        'field6', 'field7', 'field8', 'device_info', 'merchant_subvention_amount', 
        'utr', 'recon_ref_number', 'settlement_amount', 'settlement_date', 
        'service_fees', 'tsp_charges', 'convenience_fee', 'cgst', 'sgst', 'igst', 
        'token_bin', 'last_four_digits', 'arn', 'auth_code', 'conversion_status', 
        'conversion_date', 'conversion_remarks', 'mer_service_fee', 'currency_type', 
        'network_type', 'unmapped_status', 'category', 'sub_category'
    ]
    
    # Sample data
    statuses = ['success', 'failed', 'pending', 'refunded']
    banks = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak']
    card_types = ['Debit Card', 'Credit Card', 'UPI', 'Net Banking']
    modes = ['CC', 'DC', 'NB', 'UPI', 'WALLET']
    states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat']
    countries = ['India']
    
    records = []
    
    for i in range(num_records):
        status = random.choice(statuses)
        txnid = f"TXN{random.randint(100000000, 999999999)}"
        added_date = datetime.now() - timedelta(days=random.randint(0, 30))
        
        record = {
            'status': status,
            'txnid': txnid,
            'addedon': added_date.strftime('%Y-%m-%d %H:%M:%S'),
            'id': f"ID{random.randint(10000, 99999)}",
            'amount': round(random.uniform(500, 50000), 2),
            'productinfo': f"Admission Fee - Course {random.randint(1, 10)}",
            'firstname': f"Student{i+1}",
            'email': f"student{i+1}@example.com",
            'phone': f"98765{random.randint(10000, 99999)}",
            'ip': f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
            'merchant_id': f"MERCHANT{random.randint(1000, 9999)}",
            'bank_name': random.choice(banks),
            'bank_ref_no': f"BRN{random.randint(1000000, 9999999)}",
            'cardtype': random.choice(card_types),
            'mode': random.choice(modes),
            'error_code': '' if status == 'success' else f'E{random.randint(100, 999)}',
            'errorDescription': '' if status == 'success' else 'Transaction failed',
            'error_message': '' if status == 'success' else 'Insufficient balance',
            'pgmid': f"PG{random.randint(100, 999)}",
            'pg_response': 'Transaction successful' if status == 'success' else 'Transaction failed',
            'issuing_bank': random.choice(banks),
            'payment_source': 'web',
            'name_on_card': f"Student {i+1}",
            'card_number': f"XXXX-XXXX-XXXX-{random.randint(1000, 9999)}",
            'address_line1': f"{random.randint(1, 999)} Main Street",
            'address_line2': f"Apartment {random.randint(1, 50)}",
            'state': random.choice(states),
            'country': 'India',
            'zipcode': f"{random.randint(100000, 999999)}",
            'shipping_firstname': f"Student{i+1}",
            'shipping_lastname': f"LastName{i+1}",
            'shipping_address1': f"{random.randint(1, 999)} Main Street",
            'shipping_address2': f"Apartment {random.randint(1, 50)}",
            'shipping_city': 'Mumbai',
            'shipping_state': random.choice(states),
            'shipping_country': 'India',
            'shipping_zipcode': f"{random.randint(100000, 999999)}",
            'shipping_phone': f"98765{random.randint(10000, 99999)}",
            'transaction_fee': round(random.uniform(10, 100), 2),
            'discount': round(random.uniform(0, 500), 2),
            'additional_charges': round(random.uniform(0, 100), 2),
            'amount(inr)': round(random.uniform(500, 50000), 2),
            'udf1': f"UDF1_Value_{i+1}",
            'udf2': f"UDF2_Value_{i+1}",
            'udf3': f"UDF3_Value_{i+1}",
            'udf4': f"UDF4_Value_{i+1}",
            'udf5': f"UDF5_Value_{i+1}",
            'field0': '',
            'field1': '',
            'field2': '',
            'field3': '',
            'field4': '',
            'field5': '',
            'field6': '',
            'field7': '',
            'field8': '',
            'device_info': 'Web Browser - Chrome',
            'merchant_subvention_amount': round(random.uniform(0, 50), 2),
            'utr': f"UTR{random.randint(100000000, 999999999)}",
            'recon_ref_number': f"REC{random.randint(100000, 999999)}",
            'settlement_amount': round(random.uniform(500, 50000), 2),
            'settlement_date': (added_date + timedelta(days=2)).strftime('%Y-%m-%d'),
            'service_fees': round(random.uniform(5, 50), 2),
            'tsp_charges': round(random.uniform(2, 20), 2),
            'convenience_fee': round(random.uniform(5, 30), 2),
            'cgst': round(random.uniform(10, 100), 2),
            'sgst': round(random.uniform(10, 100), 2),
            'igst': round(random.uniform(20, 200), 2),
            'token_bin': f"{random.randint(100000, 999999)}",
            'last_four_digits': f"{random.randint(1000, 9999)}",
            'arn': f"ARN{random.randint(10000000, 99999999)}",
            'auth_code': f"AUTH{random.randint(100000, 999999)}",
            'conversion_status': 'converted' if status == 'success' else 'not_converted',
            'conversion_date': added_date.strftime('%Y-%m-%d') if status == 'success' else '',
            'conversion_remarks': 'Successfully converted' if status == 'success' else '',
            'mer_service_fee': round(random.uniform(10, 100), 2),
            'currency_type': 'INR',
            'network_type': 'VISA' if random.random() > 0.5 else 'MASTERCARD',
            'unmapped_status': '',
            'category': 'Education',
            'sub_category': 'Admission Fee'
        }
        
        records.append(record)
    
    return pd.DataFrame(records)

def main():
    """Generate and save sample Excel file"""
    print("Generating sample payment gateway data...")
    
    # Generate 20 sample records
    df = generate_sample_payments(20)
    
    # Save to Excel file
    output_file = "sample_payments.xlsx"
    df.to_excel(output_file, index=False, engine='openpyxl')
    
    print(f"✅ Sample file created: {output_file}")
    print(f"📊 Total records: {len(df)}")
    print(f"📋 Total columns: {len(df.columns)}")
    print("\nColumn names:")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")
    
    print("\n✨ You can now use this file to test the payment upload API!")
    print(f"   Upload endpoint: POST http://localhost:8000/api/payment-gateway/upload/")

if __name__ == "__main__":
    main()

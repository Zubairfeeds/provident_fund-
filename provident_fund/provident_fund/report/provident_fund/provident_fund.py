# Copyright (c) 2024, Atom Global and contributors
# For license information, please see license.txt

import frappe
import json


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data
def execute(filters=None):
    columns, data = get_columns(), get_provident_fund_report(filters)
    return columns, data

def get_columns():
    columns = [
        {"fieldname": "id", "label": "ID", "fieldtype": "Link", "options": "Provident Fund", "width": 150},
        {"fieldname": "employee", "label": "Employee", "fieldtype": "Link", "options": "PF Employee Details", "width": 150},
        {"fieldname": "employee_name", "label": "Employee Name", "fieldtype": "Data", "width": 150},
        {"fieldname": "posting_date", "label": "Posting Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "start_date", "label": "Start Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "end_date", "label": "End Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "pf", "label": "PF", "fieldtype": "Data", "width": 150},
        {"fieldname": "pfcc", "label": "PFCC", "fieldtype": "Data", "width": 150},
        {"fieldname": "pf_total", "label": "PF Total", "fieldtype": "Currency", "width": 120},
        # {"fieldname": "grand_total", "label": "Grand Total", "fieldtype": "Currency", "width": 120},
    ]
    return columns

@frappe.whitelist()
def get_provident_fund_report(filters=None):
    if isinstance(filters, str):
        filters = json.loads(filters)
    
    conditions = "1=1"
    params = {}
    
    if filters.get("id"):
        conditions += " AND pf.name = %(id)s"
        params["id"] = filters.get("id")
    if filters.get("from_date"):
        conditions += " AND pf.posting_date >= %(from_date)s"
        params["from_date"] = filters.get("from_date")
    if filters.get("to_date"):
        conditions += " AND pf.posting_date <= %(to_date)s"
        params["to_date"] = filters.get("to_date")
    if filters.get("employee"):
        conditions += " AND pfe.employee = %(employee)s"
        params["employee"] = filters.get("employee")
    if filters.get("employee_name"):
        conditions += " AND pfe.employee_name = %(employee_name)s"
        params["employee_name"] = filters.get("employee_name")

    if filters.get("from_date") and filters.get("to_date"):
        data = frappe.db.sql(f"""
            SELECT 
                pf.name AS id, pf.start_date, pf.end_date, pf.posting_date,
                pfe.employee, pfe.employee_name, pfe.pf, pfe.pfcc,
                SUM(pfe.pf_total) AS pf_total, 
                SUM(pfe.pf_profit) AS pf_profit, SUM(pfe.total) AS total
            FROM 
                `tabProvident Fund` pf
            JOIN 
                `tabPF Employee Details` pfe ON pfe.parent = pf.name
            WHERE 
                pf.docstatus = 1 AND {conditions}
            GROUP BY 
                pf.name, pfe.employee, pfe.employee_name, pfe.pf, pfe.pfcc
        """, params, as_dict=True)
    else:
        data = frappe.db.sql(f"""
            SELECT 
                pf.name AS id, pf.start_date, pf.end_date, pf.posting_date,
                pfe.employee, pfe.employee_name, pfe.pf, pfe.pfcc, pfe.pf_total, pfe.pf_profit, pfe.total
            FROM 
                `tabProvident Fund` pf
            JOIN 
                `tabPF Employee Details` pfe ON pfe.parent = pf.name
            WHERE 
                pf.docstatus = 1 AND {conditions}
        """, params, as_dict=True)

    return data

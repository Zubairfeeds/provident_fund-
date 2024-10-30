


import frappe
import json

def execute(filters=None):
    columns, data = get_columns(), get_pf_profit_report(filters)
    return columns, data

def get_columns():
    columns = [
        {"fieldname": "id", "label": "ID", "fieldtype": "Link", "options": "PF Profit", "width": 150},
        {"fieldname": "pf_member", "label": "PF Member", "fieldtype": "Link", "options": "PF Member Details", "width": 150},
        {"fieldname": "full_name", "label": "Member Name", "fieldtype": "Data", "width": 150},
        {"fieldname": "posting_date", "label": "Posting Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "start_date", "label": "Start Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "end_date", "label": "End Date", "fieldtype": "Date", "width": 100},
        {"fieldname": "profit_margin", "label": "Profit Margin", "fieldtype": "Float", "width": 100},
        {"fieldname": "pf", "label": "PF", "fieldtype": "Data", "width": 150},
        {"fieldname": "pfcc", "label": "PFCC", "fieldtype": "Data", "width": 150},
        {"fieldname": "pf_total", "label": "PF Total", "fieldtype": "Currency", "width": 120},
        {"fieldname": "pf_profit", "label": "PF Profit", "fieldtype": "Float", "width": 100},
        {"fieldname": "total", "label": "Total", "fieldtype": "Currency", "width": 120},
        #  {"fieldname": "grand_total", "label": "Grand Total", "fieldtype": "Currency", "width": 120},
    ]
    return columns

@frappe.whitelist()
def get_pf_profit_report(filters=None):
    if isinstance(filters, str):
        filters = json.loads(filters)
    
    conditions = "1=1"
    params = {}
    
    if filters.get("id"):
        conditions += " AND pfp.name = %(id)s"
        params["id"] = filters.get("id")
    if filters.get("from_date"):
        conditions += " AND pfp.posting_date >= %(from_date)s"
        params["from_date"] = filters.get("from_date")
    if filters.get("to_date"):
        conditions += " AND pfp.posting_date <= %(to_date)s"
        params["to_date"] = filters.get("to_date")
    if filters.get("pf_member"):
        conditions += " AND pfmd.pf_member = %(pf_member)s"
        params["pf_member"] = filters.get("pf_member")
    if filters.get("full_name"):
        conditions += " AND pfmd.full_name = %(full_name)s"
        params["full_name"] = filters.get("full_name")

    if filters.get("from_date") and filters.get("to_date"):
        data = frappe.db.sql(f"""
            SELECT 
                pfp.name AS id, pfp.start_date, pfp.end_date, pfp.posting_date, pfp.profit_margin, pfp.grand_total,
                pfmd.pf_member, pfmd.full_name, pfmd.pf, pfmd.pfcc,
                SUM(pfmd.pf_total) AS pf_total, 
                SUM(pfmd.pf_profit) AS pf_profit, SUM(pfmd.total) AS total
            FROM 
                `tabPF Profit` pfp
            JOIN 
                `tabPF Member Details` pfmd ON pfmd.parent = pfp.name
            WHERE 
                pfp.docstatus = 1 AND {conditions}
            GROUP BY 
                pfp.name, pfmd.pf_member, pfmd.full_name, pfmd.pf, pfmd.pfcc
        """, params, as_dict=True)
    else:
        data = frappe.db.sql(f"""
            SELECT 
                pfp.name AS id, pfp.start_date, pfp.end_date, pfp.posting_date, pfp.profit_margin, pfp.grand_total,
                pfmd.pf_member, pfmd.full_name, pfmd.pf, pfmd.pfcc, pfmd.pf_total, pfmd.pf_profit, pfmd.total
            FROM 
                `tabPF Profit` pfp
            JOIN 
                `tabPF Member Details` pfmd ON pfmd.parent = pfp.name
            WHERE 
                pfp.docstatus = 1 AND {conditions}
        """, params, as_dict=True)

    return data

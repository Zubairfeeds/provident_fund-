# Copyright (c) 2024, Atom Global and contributors
# For license information, please see license.txt
import frappe
from frappe import _
from frappe.desk.reportview import get_filters_cond, get_match_cond
from frappe.model.document import Document
from datetime import datetime


class PFProfit(Document):
	pass




@frappe.whitelist()
def update_pf_profit(doc, method):
    if doc.profit_margin:
        for row in doc.get("pf_member_details"):
            row.pf_profit = row




@frappe.whitelist()
def make_journal_entry(docname):
    # Retrieve the PF Profit document
    pf_profit = frappe.get_doc("PF Profit", docname)

    # Check if a Journal Entry already exists for this PF Profit
    existing_journal_entry = frappe.db.exists("Journal Entry Account", {
        "parenttype": "Journal Entry",
        "reference_type": "PF Profit",
        "reference_name": docname
    })

    if existing_journal_entry:
        message = _("A Journal Entry for PF Profit {0} already exists").format(docname)
        frappe.throw(message)

    # Create a new Journal Entry
    journal_entry = frappe.new_doc("Journal Entry")
    journal_entry.posting_date = frappe.utils.nowdate()  # Set the posting date to the current date
    journal_entry.company = pf_profit.company  # Use the company from the PF Profit document
    #journal_entry.voucher_type = "Inter Company Journal Entry"

    # Retrieve credit and debit accounts from the PF Profit document
    credit_account = pf_profit.get("credit_account") or ""
    debit_account = pf_profit.get("debit_account") or ""

    if not credit_account or not debit_account:
        frappe.throw(_("Credit Account and Debit Account must be set in the PF Profit document"))

    # Get member details from the child table
    pf_member_details = pf_profit.get("pf_member_details", [])

    total_debit = pf_profit.get("grand_total") or 0  # The total debit is the grand total from PF Profit

    if total_debit <= 0:
        frappe.throw(_("The grand total must be greater than zero"))

    # Credit the company's account with the grand total
    journal_entry.append("accounts", {
        "account": credit_account,
        "credit_in_account_currency": total_debit,
        "reference_type": "PF Profit",
        "reference_name": docname,
    })

    # Debit each member's account
    for member_detail in pf_member_details:
        member = member_detail.get("pf_member") or ""
        total = member_detail.get("total") or 0

        if not member:
            frappe.throw(_("Member field cannot be empty"))

        if total <= 0:
            frappe.throw(_("Total for member {0} must be greater than zero").format(member))

        journal_entry.append("accounts", {
            "account": debit_account,
            "debit_in_account_currency": total,  # Each debit is unique to the member
            "reference_type": "PF Profit",
            "reference_name": docname,
            "party_type": "PF Member",
            "party": member
        })

    # Insert the Journal Entry
    journal_entry.insert()

    # Uncomment the following line to submit the journal entry
    # journal_entry.submit()

    return journal_entry.name




























# @frappe.whitelist()
# def calculate_year_to_date(full_name, current_year_start):
#     # Fetch previous PF Profit documents for the current year with status "Submitted"
#     previous_pfs = frappe.get_all(
#         "PF Profit",
#         filters={
#             "docstatus": 1,  # Submitted documents
#             "creation": [">=", current_year_start],
#         },
#         fields=["name"]
#     )

#     # Calculate Year to Date PF
#     year_to_date = 0
#     if previous_pfs:
#         for pf_doc in previous_pfs:
#             previous_pf_details = frappe.get_all(
#                 "PF Member Details",
#                 filters={
#                     "parent": pf_doc["name"],
#                     "pf_member": full_name,
#                 },
#                 fields=["pf_total"]
#             )
#             year_to_date += sum(prev_pf["pf_total"] for prev_pf in previous_pf_details)

#     return year_to_date

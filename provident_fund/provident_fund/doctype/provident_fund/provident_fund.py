import frappe
from frappe import _
from frappe.desk.reportview import get_filters_cond, get_match_cond
from frappe.model.document import Document


class ProvidentFund(Document):
	pass



@frappe.whitelist()
def get_employees(doctype, docname, department=None, branch=None, designation=None):
    try:
        # Get the Provident Fund document
        provident_fund = frappe.get_doc(doctype, docname)

        # Initialize the filter dictionary for Employee
        filters = {"employment_type": "Full-time"}

        # Add filters if provided
        if department:
            filters["department"] = department
        if branch:
            filters["branch"] = branch
        if designation:
            filters["designation"] = designation

        # Fetch all full-time employees with the given filters
        employees = frappe.get_all("Employee", filters=filters, fields=["name", "employee_name"])

        if not employees:
            frappe.msgprint(_("No employees found."))
            return

        # Fetch all relevant salary slips at once
        salary_slips = frappe.get_all(
            "Salary Slip",
            filters={
                "start_date": provident_fund.start_date,
                "status": "Submitted",
                "employee": ["in", [emp["name"] for emp in employees]],
            },
            fields=["name", "employee"],
        )

        if not salary_slips:
            frappe.msgprint(_("No salary slips found for the given employees."))
            return

        # Group salary slips by employee for faster lookup
        salary_slips_by_employee = {}
        for slip in salary_slips:
            employee_name = slip["employee"]
            if employee_name not in salary_slips_by_employee:
                salary_slips_by_employee[employee_name] = []
            salary_slips_by_employee[employee_name].append(slip)

        # Clear existing PF employee details
        provident_fund.set("pf_employee_details", [])

        # Initialize grand total
        grand_total = 0

        # Process each employee
        for employee in employees:
            employee_name = employee["name"]

            if employee_name in salary_slips_by_employee:
                total_pf = 0

                # Calculate the total PF from all relevant salary slips
                for slip in salary_slips_by_employee[employee_name]:
                    deductions = frappe.get_all(
                        "Salary Detail",
                        filters={
                            "parent": slip["name"],
                            "salary_component": "Provident Fund",
                        },
                        fields=["amount"],
                    )

                    pf_amount = sum(deduction["amount"] for deduction in deductions)
                    total_pf += pf_amount

                # Calculate PF total
                pf_total = total_pf * 2

                # Append new employee details with calculated fields
                provident_fund.append(
                    "pf_employee_details",
                    {
                        "employee": employee_name,
                        "employee_name": employee["employee_name"],
                        "pf": total_pf,
                        "pfcc": total_pf,
                        "pf_total": pf_total,
                    },
                )

                # Add to grand total
                grand_total += pf_total

        # Set the grand total in the provident_fund document
        provident_fund.grand_total = grand_total

        # Save the provident_fund object to ensure persistence
        provident_fund.save()

        # Return the employees and their salary slips
        return {
            "employees": employees,
            "salary_slips": salary_slips,
            "grand_total": grand_total,
        }

    except frappe.DoesNotExistError as e:
        frappe.throw(_("The document type does not exist: {}").format(e))
    except frappe.ValidationError as e:
        frappe.throw(_("Validation error: {}").format(e))
    except Exception as e:
        frappe.throw(_("An unexpected error occurred: {}").format(e))






@frappe.whitelist()
def make_journal_entry(docname):
    # Retrieve the Provident Fund document
    provident_fund = frappe.get_doc("Provident Fund", docname)

    # Check if a Journal Entry already exists for this Provident Fund
    existing_journal_entry = frappe.db.exists("Journal Entry Account", {
        "parenttype": "Journal Entry",
        "reference_type": "Provident Fund",
        "reference_name": docname
    })

    if existing_journal_entry:
        message = _("A Journal Entry for Provident Fund {0} already exists").format(docname)
        frappe.throw(message)

    # Create a new Journal Entry
    journal_entry = frappe.new_doc("Journal Entry")
    journal_entry.posting_date = frappe.utils.nowdate()  # Set the posting date to the current date
    journal_entry.company = provident_fund.company  # Use the company from the Provident Fund document
    journal_entry.voucher_type = "Inter Company Journal Entry"

    # Retrieve credit and debit accounts from the Provident Fund document
    credit_account = provident_fund.get("credit_account") or ""
    debit_account = provident_fund.get("debit_account") or ""

    if not credit_account or not debit_account:
        frappe.throw(_("Credit Account and Debit Account must be set in the Provident Fund document"))

    # Get employee details from the child table
    pf_employee_details = provident_fund.get("pf_employee_details", [])

    total_debit = provident_fund.get("grand_total") or 0  # The total debit is the grand total from Provident Fund

    if total_debit <= 0:
        frappe.throw(_("The grand total must be greater than zero"))

    # Debit from the company's Provident Fund liability account with the grand total
    journal_entry.append("accounts", {
        "account": debit_account,
        "debit_in_account_currency": total_debit,
        "reference_type": "Provident Fund",
        "reference_name": docname,
    })

    # Credit to each employee's account
    for employee_detail in pf_employee_details:
        employee = employee_detail.get("employee") or ""
        total = employee_detail.get("pf_total") or 0

        if not employee:
            frappe.throw(_("Employee field cannot be empty"))

        if total <= 0:
            frappe.throw(_("Total for employee {0} must be greater than zero").format(employee))

        journal_entry.append("accounts", {
            "account": credit_account,
            "credit_in_account_currency": total,  # Each credit is unique to the employee
            "reference_type": "Provident Fund",
            "reference_name": docname,
            "party_type": "Employee",
            "party": employee
        })

    # Insert the Journal Entry
    journal_entry.insert()

    # Uncomment the following line to submit the journal entry
    # journal_entry.submit()

    return journal_entry.name





@frappe.whitelist()
def create_pf_profit(provident_fund):
    # Handle the case where `provident_fund` is passed as a string (name of the document)
    if isinstance(provident_fund, str):
        provident_fund = frappe.get_doc("Provident Fund", provident_fund)
    
    # Check if provident_fund is None
    if not provident_fund:
        frappe.throw(_("Provident Fund document not found"))

    # Create a new PF Profit document
    pf_profit = frappe.new_doc("PF Profit")
    pf_profit.company = "Zubair Feeds Provident Fund Trust"
    pf_profit.provident_fund = provident_fund.name
    pf_profit.grand_total = provident_fund.grand_total
    pf_profit.start_date = provident_fund.start_date
    pf_profit.end_date = provident_fund.end_date
    pf_profit.branch = provident_fund.branch
    pf_profit.department = provident_fund.department
    pf_profit.designation = provident_fund.designation
    # Add other fields as necessary

    # Dictionary to keep track of unique employees
    added_employees = {}

    for pf_detail in provident_fund.pf_employee_details:
        employee = pf_detail.employee
        if employee not in added_employees:
            added_employees[employee] = True
            pf_profit.append('pf_member_details', {
                'employee': pf_detail.employee,
                'employee_name': pf_detail.employee_name,
                'full_name': pf_detail.employee_name,
                'pf': pf_detail.pf,
                'pfcc': pf_detail.pfcc,
                'pf_total': pf_detail.pf_total,
                'year_to_date': pf_detail.year_to_date,
                # Add other fields accordingly
            })
    
    # Save the new PF Profit document
    pf_profit.insert()
    
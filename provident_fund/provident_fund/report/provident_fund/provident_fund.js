// Copyright (c) 2024, Atom Global and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Provident Fund"] = {
	"filters": [
		{
            "fieldname": "id",
            "label": __("ID"),
            "fieldtype": "Link",
            "options": "Provident Fund",
            "default": ""
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.add_months(frappe.datetime.nowdate(), -1)
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.nowdate()
        },
        {
            "fieldname": "employee",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee"
        },
       
    ],
    "onload": function(report) {
        frappe.call({
            method: "provident_fund.provident_fund.report.provident_fund.provident_fund.get_provident_fund_report",
            args: {
                filters: JSON.stringify(report.get_values())
            },
            callback: function(r) {
                if (r.message) {
                    report.data = r.message;
                    report.refresh();
                }
            }
        });
    },
    "get_data": function(filters) {
        return frappe.call({
            method: "provident_fund.provident_fund.report.provident_fund.provident_fund.get_provident_fund_report",
            args: {
                filters: JSON.stringify(filters)
            },
            callback: function(r) {
                if (r.message) {
                    frappe.query_report.set_data(r.message);
                    frappe.query_report.refresh();
                }
            }
        });
    }
};
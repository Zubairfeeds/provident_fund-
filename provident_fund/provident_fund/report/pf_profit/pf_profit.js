frappe.query_reports["PF Profit"] = {
    "filters": [
		{
            "fieldname": "id",
            "label": __("ID"),
            "fieldtype": "Link",
            "options": "PF Profit",
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
            "fieldname": "pf_member",
            "label": __("Member"),
            "fieldtype": "Link",
            "options": "PF Member"
        },
       
    ],
    "onload": function(report) {
        frappe.call({
            method: "provident_fund.provident_fund.report.pf_profit.pf_profit.get_pf_profit_report",
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
            method: "provident_fund.provident_fund.report.pf_profit.pf_profit.get_pf_profit_report",
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

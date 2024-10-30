// Copyright (c) 2024, Atom Global and contributors
// For license information, please see license.txt

frappe.ui.form.on('Provident Fund', {
	// refresh: function(frm) {

	// }
});


// Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Provident Fund', {
    refresh: function (frm) {
        if (frm.doc.docstatus == 0 && !frm.is_new()) {
            frm.add_custom_button(__('Get Employees'), function () {
                get_employees(frm);
            }).toggleClass("btn-primary", !(frm.doc.employees || []).length);
        }
    }
    
});


frappe.ui.form.on("Provident Fund", {
    start_date: function(frm) {
        if (frm.doc.start_date) {
            // Start date ko ek mahine aage badha kar, aur phir ek din peechay ja kar end date set karein
            let start_date = new Date(frm.doc.start_date);

            // Agle mahine ka same din set karen
            let end_date = new Date(start_date);
            end_date.setMonth(start_date.getMonth() + 1);

            // Ek din peechay jaen
            end_date.setDate(start_date.getDate() - 1);

            // End date ko ISO format mein set karein
            frm.set_value("end_date", end_date.toISOString().split("T")[0]);
        }
    }
});

frappe.ui.form.on("Provident Fund", {
    refresh: function(frm) {
        // Add a button to create Journal Entry
        if (frm.doc.docstatus == 1) {
            frm.add_custom_button(__('Journal Entry'), function() {
                frappe.call({
                    method: 'provident_fund.provident_fund.doctype.provident_fund.provident_fund.make_journal_entry',
                    args: {
                        docname: frm.doc.name
                    },
                    callback: function(response) {
                        if (response.message) {
                            const journal_entry_name = response.message; // Get the Journal Entry name
                            frappe.set_route("Form", "Journal Entry", journal_entry_name); // Redirect to the new Journal Entry
                        }
                    },
                    freeze: true, // Indicates that the user interface should be disabled during the call
                    freeze_message: __("Creating Journal Entry...") // Message displayed while processing
                });
            }, __("Create"));
            frm.page.set_inner_btn_group_as_primary(__('Create')); // Place button under the 'Create' menu
        }
    }
});





// function get_employees(frm) {
//     var department = frm.doc.department;
//     var branch = frm.doc.branch;
//     var designation = frm.doc.designation;

//     frappe.call({
//         method: 'provident_fund.provident_fund.doctype.provident_fund.provident_fund.get_employees',
//         args: {
//             doctype: frm.doctype,
//             docname: frm.docname,
//             department: department,
//             branch: branch,
//             designation: designation
//         },
//         callback: function (r) {
//             if (r.message) {
//                 frm.clear_table("pf_employee_details");

//                 $.each(r.message, function (i, employee) {
//                     var row = frm.add_child("pf_employee_details");
//                     row.employee = employee.employee;
//                     row.employee_name = employee.employee_name;
//                     row.pf = employee.pf;
//                 });

//                 frm.refresh_field("pf_employee_details");
//             }
//         }
//     });
// }


// frappe.ui.form.on('Provident Fund', {
//     profit_margin: function (frm) {
//         update_pf_profit(frm);
//     },
//     pf_employee_details_on_form_rendered: function (frm) {
//         update_grand_total(frm);
//     },
//     get_employees: function (frm) {
//         update_grand_total(frm);
//     },
// z
// });


// function update_pf_profit(frm) {
//     var profit_margin = frm.doc.profit_margin;

//     if (profit_margin) {
//         $.each(frm.doc.pf_employee_details || [], function (i, row) {
//             row.pf_profit = row.pf_total * profit_margin
//             // row.total = row.pf_total + row.pf_frofit
//         });

//         frm.refresh_field("pf_employee_details");

//         // Update grand_total after updating pf_total
//         // update_grand_total(frm);
//     }

// }


// // Trigger the function when form is refreshed or fields are changed
// // frappe.ui.form.on("Provident Fund", {
// //     refresh: function(frm) {
// //         update_total(frm);
// //     },
// //     pf_total: function(frm) {
// //         update_total(frm);
// //     },
// //     pf_profit: function(frm) {
// //         update_total(frm);
// //     }
// // });

// frappe.ui.form.on('PF Employee Details', {
//     pf_employee_details_remove: function (frm, cdt, cdn) {
//         // Calculate grand total after deleting a row
//         update_grand_total(frm);
//     }

// })

// frappe.ui.form.on("Provident Fund", {
//     department: function(frm) {
//         // Department field update hone par pf_employee_details table ko clear karein
//         frm.clear_table("pf_employee_details");
//         frm.refresh_field("pf_employee_details");
//     },
//     branch: function(frm) {
//         // Branch field update hone par pf_employee_details table ko clear karein
//         frm.clear_table("pf_employee_details");
//         frm.refresh_field("pf_employee_details");
//     },
//     designation: function(frm) {
//         // Designation field update hone par pf_employee_details table ko clear karein
//         frm.clear_table("pf_employee_details");
//         frm.refresh_field("pf_employee_details");
//     },
//     start_date: function(frm) {
//         // Designation field update hone par pf_employee_details table ko clear karein
//         frm.clear_table("pf_employee_details");
//         frm.refresh_field("pf_employee_details");
//     }

// });


// function update_child_total(frm) {
//     // Iterate over each row in the child table
//     $.each(frm.doc.pf_employee_details || [], function (i, row) {
//         // Ensure `pf_total` and `pf_profit` are valid numbers
//         var pf_total = parseFloat(row.pf_total || 0);
//         var pf_profit = parseFloat(row.pf_profit || 0);
        
//         // Calculate the `total` for this row
//         row.total = pf_total + pf_profit;
//     });

//     // Refresh the child table to reflect the changes
//     frm.refresh_field("pf_employee_details");
// }

// function calculate_grand_total(frm) {
//     var grand_total = 0;

//     // Iterate over each row in the child table
//     $.each(frm.doc.pf_employee_details || [], function (i, row) {
//         // Ensure `pf_total` and `pf_profit` are valid numbers before adding
//         var pf_total = parseFloat(row.pf_total || 0);
//         var pf_profit = parseFloat(row.pf_profit || 0);
        
//         var row_total = pf_total + pf_profit;  // Calculate total for this row
        
//         grand_total += row_total;  // Accumulate the grand total
//     });

//     frm.set_value("grand_total", grand_total);  // Update the grand total on the parent document
//     frm.refresh_field("grand_total");  // Refresh to update the UI
// }


// frappe.ui.form.on("Provident Fund", {
//     profit_margin: function(frm) {
//         update_child_total(frm);  // Recalculate when the form is refreshed
//         calculate_grand_total(frm);
//     },
//     pf_total: function(frm) {
//         update_child_total(frm);  // Recalculate when `pf_total` changes
//         calculate_grand_total(frm);
//     },
//     pf_profit: function(frm) {
//         update_child_total(frm);  // Recalculate when `pf_profit` changes
//         calculate_grand_total(frm);
//     },
//     pf_employee_details_add: function(frm) {
//         update_child_total(frm);  // Recalculate when a new row is added
//         calculate_grand_total(frm);
//     },
//     pf_employee_details_remove: function(frm) {
//         update_child_total(frm);  // Recalculate when a row is removed
//         calculate_grand_total(frm);
//     }
// });



function get_employees(frm) {
    var department = frm.doc.department || '';
    var branch = frm.doc.branch || '';
    var designation = frm.doc.designation || '';

    frappe.call({
        method: 'provident_fund.provident_fund.doctype.provident_fund.provident_fund.get_employees',
        args: {
            doctype: frm.doctype,
            docname: frm.docname,
            department: department,
            branch: branch,
            designation: designation
        },
        callback: function (r) {
            if (r.message) {
                frm.clear_table("pf_employee_details");

                $.each(r.message, function (i, employee) {
                    var row = frm.add_child("pf_employee_details");
                    row.employee = employee.employee || '';
                    row.employee_name = employee.employee_name || '';
                    row.pf = employee.pf || 0;
                });

                frm.refresh_field("pf_employee_details");
                calculate_grand_total(frm);
            }
        }
    });
}

frappe.ui.form.on('Provident Fund', {
    pf_employee_details_on_form_rendered: function (frm) {
        calculate_grand_total(frm);
    },
    get_employees: function (frm) {
        get_employees(frm);
    },
    department: function (frm) {
        frm.clear_table("pf_employee_details");
        frm.refresh_field("pf_employee_details");
        calculate_grand_total(frm);
    },
    branch: function (frm) {
        frm.clear_table("pf_employee_details");
        frm.refresh_field("pf_employee_details");
        calculate_grand_total(frm);
    },
    designation: function (frm) {
        frm.clear_table("pf_employee_details");
        frm.refresh_field("pf_employee_details");
        calculate_grand_total(frm);
    },
    start_date: function (frm) {
        frm.clear_table("pf_employee_details");
        frm.refresh_field("pf_employee_details");
        calculate_grand_total(frm);
    },
    pf_employee_details_add: function (frm) {
        calculate_grand_total(frm);
    },
    pf_employee_details_remove: function (frm) {
        calculate_grand_total(frm);
    }
});

frappe.ui.form.on('PF Employee Details', {
    pf_employee_details_remove: function (frm, cdt, cdn) {
        calculate_grand_total(frm);
    }
});

function calculate_grand_total(frm) {
    var grand_total = 0;

    // Iterate over each row in the child table
    $.each(frm.doc.pf_employee_details || [], function (i, row) {
        var pf_total = parseFloat(row.pf_total || 0); // Ensure `pf_total` is a valid number
        grand_total += pf_total;  // Accumulate the grand total
    });

    frm.set_value("grand_total", grand_total);  // Update the grand total on the parent document
    frm.refresh_field("grand_total");  // Refresh to update the UI
}




frappe.ui.form.on('Provident Fund', {
    on_submit: function(frm) {
        frappe.call({
            method: 'provident_fund.provident_fund.doctype.provident_fund.provident_fund.create_pf_profit',
            args: {
                provident_fund: frm.doc.name
            },
            callback: function(response) {
                if (response.message) {
                    frappe.msgprint(__('PF Profit document created: {0}', [response.message]));
                }
            }
        });
    }
});

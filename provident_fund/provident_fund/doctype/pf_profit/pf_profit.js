// Copyright (c) 2024, Atom Global and contributors
// For license information, please see license.txt

frappe.ui.form.on('PF Profit', {
	// refresh: function(frm) {

	// }
});








frappe.ui.form.on('PF Profit', {
    profit_margin: function(frm) {
        update_pf_profit(frm);
    },
    pf_member_details_on_form_rendered: function(frm) {
        update_grand_total(frm);
    },
    pf_total: function(frm) {
        update_total(frm);
    },
    pf_profit: function(frm) {
        update_total(frm);
    },
    pf_member_details_add: function(frm) {
        update_child_total(frm);
        calculate_grand_total(frm);
    },
    pf_member_details_remove: function(frm, cdt, cdn) {
        update_child_total(frm);
        calculate_grand_total(frm);
    },
    refresh: function(frm) {
        // Add a button to create Journal Entry
        if (frm.doc.docstatus == 0) {
            frm.add_custom_button(__('Journal Entry'), function() {
                frappe.call({
                    method: 'provident_fund.provident_fund.doctype.pf_profit.pf_profit.make_journal_entry',
                    args: {
                        docname: frm.doc.name
                    },
                    callback: function(response) {
                        if (response.message) {
                            const journal_entry_name = response.message;
                            frappe.set_route("Form", "Journal Entry", journal_entry_name);
                        }
                    },
                    freeze: true,
                    freeze_message: __("Creating Journal Entry...")
                });
            }, __("Create"));
            frm.page.set_inner_btn_group_as_primary(__('Create'));
        }
    }
});

function update_pf_profit(frm) {
    var profit_margin = frm.doc.profit_margin;

    $.each(frm.doc.pf_member_details || [], function(i, row) {
        if (profit_margin) {
            row.pf_profit = row.pf_total * profit_margin;
        } else {
            row.pf_profit = 0;
        }
        row.total = row.pf_total + row.pf_profit;
    });

    frm.refresh_field("pf_member_details");
    update_grand_total(frm);
}

function update_grand_total(frm) {
    var grand_total = 0;

    $.each(frm.doc.pf_member_details || [], function(i, row) {
        grand_total += row.total;
    });

    frm.set_value("grand_total", grand_total);
    frm.refresh_field("grand_total");
}

function update_total(frm) {
    if (frm.doc.pf_total && frm.doc.pf_profit) {
        var pf_total = parseFloat(frm.doc.pf_total);
        var pf_profit = parseFloat(frm.doc.pf_profit);

        var total = pf_total + pf_profit;

        frm.set_value("total", total);
        frm.refresh_field("total");
    }
}

function update_child_total(frm) {
    $.each(frm.doc.pf_member_details || [], function(i, row) {
        var pf_total = parseFloat(row.pf_total || 0);
        var pf_profit = parseFloat(row.pf_profit || 0);

        row.total = pf_total + pf_profit;
    });

    frm.refresh_field("pf_member_details");
}

function calculate_grand_total(frm) {
    var grand_total = 0;

    $.each(frm.doc.pf_member_details || [], function(i, row) {
        var pf_total = parseFloat(row.pf_total || 0);
        var pf_profit = parseFloat(row.pf_profit || 0);

        var row_total = pf_total + pf_profit;
        grand_total += row_total;
    });

    frm.set_value("grand_total", grand_total);
    frm.refresh_field("grand_total");
}















// frappe.ui.form.on('PF Profit', {
//     profit_margin: function (frm) {
//         update_pf_profit(frm);
//     },
//     pf_member_details_on_form_rendered: function (frm) {
//         update_grand_total(frm);
//     },
//     // pf_member_details_before_remove: function (frm) {
//     //     console.log("Before remove event triggered");
//     //     update_grand_total_after_delete(frm);
//     // }
// });


// function update_pf_profit(frm) {
//     var profit_margin = frm.doc.profit_margin;

//     if (profit_margin) {
//         $.each(frm.doc.pf_member_details || [], function (i, row) {
//             row.pf_profit = row.pf_total * profit_margin
//             row.total = row.pf_total + row.pf_frofit
//         });

//         frm.refresh_field("pf_member_details");

//         // Update grand_total after updating pf_total
//         update_grand_total(frm);
//     }

// }

// function update_grand_total(frm) {
//     var grand_total = 0;

//     $.each(frm.doc.pf_member_details || [], function (i, row) {
//         grand_total += row.total;
//     });

//     frm.set_value("grand_total", grand_total);

//     frm.refresh_field("pf_member_details");
// }



// function update_total(frm) {
//     if (frm.doc.pf_total && frm.doc.pf_profit) {
//         // Ensure the values are numeric before calculating
//         var pf_total = parseFloat(frm.doc.pf_total);
//         var pf_profit = parseFloat(frm.doc.pf_profit);
        
//         var total = pf_total + pf_profit;  // Calculate the total
        
//         frm.set_value("total", total);  // Set the total fields
//         frm.refresh_field("total");  // Refresh to show the updated value
//     }
// }

// // Trigger the function when form is refreshed or fields are changed
// frappe.ui.form.on("PF Profit", {
//     refresh: function(frm) {
//         update_total(frm);
//     },
//     pf_total: function(frm) {
//         update_total(frm);
//     },
//     pf_profit: function(frm) {
//         update_total(frm);
//     }
// });



// frappe.ui.form.on('PF Member Details', {
//     pf_member_details_remove: function (frm, cdt, cdn) {
//         // Calculate grand total after deleting a row
//         update_grand_total(frm);
//     }

// })



// function update_child_total(frm) {
//     // Iterate over each row in the child table
//     $.each(frm.doc.pf_member_details || [], function (i, row) {
//         // Ensure `pf_total` and `pf_profit` are valid numbers
//         var pf_total = parseFloat(row.pf_total || 0);
//         var pf_profit = parseFloat(row.pf_profit || 0);
        
//         // Calculate the `total` for this row
//         row.total = pf_total + pf_profit;
//     });

//     // Refresh the child table to reflect the changes
//     frm.refresh_field("pf_member_details");
// }

// function calculate_grand_total(frm) {
//     var grand_total = 0;

//     // Iterate over each row in the child table
//     $.each(frm.doc.pf_member_details || [], function (i, row) {
//         // Ensure `pf_total` and `pf_profit` are valid numbers before adding
//         var pf_total = parseFloat(row.pf_total || 0);
//         var pf_profit = parseFloat(row.pf_profit || 0);
        
//         var row_total = pf_total + pf_profit;  // Calculate total for this row
        
//         grand_total += row_total;  // Accumulate the grand total
//     });

//     frm.set_value("grand_total", grand_total);  // Update the grand total on the parent document
//     frm.refresh_field("grand_total");  // Refresh to update the UI
// }


// frappe.ui.form.on("PF Profit", {
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
//     pf_member_details_add: function(frm) {
//         update_child_total(frm);  // Recalculate when a new row is added
//         calculate_grand_total(frm);
//     },
//     pf_member_details_remove: function(frm) {
//         update_child_total(frm);  // Recalculate when a row is removed
//         calculate_grand_total(frm);
//     }
// });



// frappe.ui.form.on('PF Profit', {
//     profit_margin: function(frm) {
//         // Ensure the fields you need are available
//         if (frm.doc.employee_name && frm.doc.current_year_start && frm.doc.profit_margin) {
//             frappe.call({
//                 method: "provident_fund.provident_fund.doctype.pf_profit.pf_profit.calculate_year_to_date",
//                 args: {
//                     employee_name: frm.doc.employee_name,
//                     current_year_start: frm.doc.current_year_start,
//                     profit_margin: frm.doc.profit_margin // Include profit_margin in the call
//                 },
//                 callback: function(response) {
//                     if (response.message !== undefined) {
//                         frm.set_value('year_to_date', response.message);
//                         frm.refresh_field('year_to_date');
//                     } else {
//                         console.log("No response message received.");
//                     }
//                 },
//                 error: function(error) {
//                     console.error("An error occurred:", error);
//                 }
//             });
//         }
//     }
// });



// frappe.ui.form.on("PF Profit", {
//     refresh: function(frm) {
//         // Add a button to create Journal Entry
//         if (frm.doc.docstatus == 0) {
//             frm.add_custom_button(__('Journal Entry'), function() {
//                 frappe.call({
//                     method: 'provident_fund.provident_fund.doctype.pf_profit.pf_profit.make_journal_entry',
//                     args: {
//                         docname: frm.doc.name
//                     },
//                     callback: function(response) {
//                         if (response.message) {
//                             const journal_entry_name = response.message; // Get the Journal Entry name
//                             frappe.set_route("Form", "Journal Entry", journal_entry_name); // Redirect to the new Journal Entry
//                         }
//                     },
//                     freeze: true, // Indicates that the user interface should be disabled during the call
//                     freeze_message: __("Creating Journal Entry...") // Message displayed while processing
//                 });
//             }, __("Create"));
//             frm.page.set_inner_btn_group_as_primary(__('Create')); // Place button under the 'Create' menu
//         }
//     }
// });



















// frappe.ui.form.on('PF Profit', {
//     profit_margin: function(frm) {
//         // Trigger calculation when the profit margin field is updated
//         calculateYearToDate(frm);
//     }
// });

// function calculateYearToDate(frm) {
//     if (!frm.doc.__islocal) {
//         // Fetch the current year's start date (you can customize this as needed)
//         let currentYearStart = frappe.datetime.get_today().split('-')[0] + '-01-01';
//         // Iterate through each row in the child table
//         frm.doc.pf_member_details.forEach((row) => {
//             frappe.call({
//                 method: 'provident_fund.provident_fund.doctype.pf_profit.pf_profit.calculate_year_to_date',
//                 args: {
//                     pf_member: row.pf_member,
//                     current_year_start: currentYearStart
//                 },
//                 callback: function(r) {
//                     let yearToDate;
//                     if (r.message) {
//                         // Set the year_to_date field with the fetched value + current total
//                         yearToDate = r.message + row.total;
//                     } else {
//                         // If no previous PF Profit, set year_to_date to current total
//                         yearToDate = row.total;
//                     }
//                     frappe.model.set_value(row.doctype, row.name, 'year_to_date', yearToDate);
//                 }
//             });
//         });
//     }
// }



// frappe.ui.form.on('PF Profit', {
//     profit_margin: function (frm) {
//         update_pf_profit(frm);
//     },
//     pf_member_details_on_form_rendered: function (frm) {
//         update_grand_total(frm);
//     },
//     pf_member_details_add: function (frm) {
//         update_child_total(frm);
//         calculate_grand_total(frm);
//     },
//     pf_member_details_remove: function (frm) {
//         update_child_total(frm);
//         calculate_grand_total(frm);
//     },
//     pf_total: function (frm) {
//         update_total(frm);
//     },
//     pf_profit: function (frm) {
//         update_total(frm);
//     },
//     refresh: function (frm) {
//         update_total(frm);
//     }
// });

// function update_pf_profit(frm) {
//     var profit_margin = frm.doc.profit_margin;

//     if (profit_margin) {
//         $.each(frm.doc.pf_member_details || [], function (i, row) {
//             row.pf_profit = row.pf_total * profit_margin;
//             row.total = row.pf_total + row.pf_profit;
//             row.year_to_date = row.total + row.year_to_date
//         });

//         frm.refresh_field("pf_member_details");

//         // Update grand_total after updating pf_total
//         update_grand_total(frm);
//     }
// }

// function update_grand_total(frm) {
//     var grand_total = 0;

//     $.each(frm.doc.pf_member_details || [], function (i, row) {
//         grand_total += row.total || 0;
//     });

//     frm.set_value("grand_total", grand_total);
//     frm.refresh_field("grand_total");
// }

// function update_total(frm) {
//     if (frm.doc.pf_total && frm.doc.pf_profit) {
//         var pf_total = parseFloat(frm.doc.pf_total) || 0;
//         var pf_profit = parseFloat(frm.doc.pf_profit) || 0;

//         var total = pf_total + pf_profit;
//         frm.set_value("total", total);
//         frm.refresh_field("total");
//     }
// }

// function update_child_total(frm) {
//     $.each(frm.doc.pf_member_details || [], function (i, row) {
//         var pf_total = parseFloat(row.pf_total) || 0;
//         var pf_profit = parseFloat(row.pf_profit) || 0;
        
//         row.total = pf_total + pf_profit;
//     });

//     frm.refresh_field("pf_member_details");
// }




// Copyright (c) 2025, Apeksha Raut and contributors
// For license information, please see license.txt

frappe.ui.form.on("Plantation Master", {
  crop_master: function (frm) {
    if (frm.doc.crop_master) {
      console.log("Crop Master selected:", frm.doc.crop_master);
      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Crop Master",
          name: frm.doc.crop_master,
        },
        callback: function (r) {
          if (r.message) {
            const crop = r.message;
            console.log("Crop data fetched:", crop);
            frm.clear_table("fertilizer_plan");
            (crop.fertilizer_suggestion || []).forEach((row) => {
              let d = frm.add_child("fertilizer_plan");
              d.dose = row.dose;
              d.days = row.days;
              d.fertilizer_name = row.fertilizer_name;
              d.quantity = row.quantity;
              d.units_of_measure = row.units_of_measure;

              // Plantation date ke base pe date calculate karo
              if (frm.doc.plantation_date) {
                let plantation_date = frappe.datetime.str_to_obj(
                  frm.doc.plantation_date
                );
                let new_date = frappe.datetime.add_days(
                  plantation_date,
                  row.days
                );
                d.suggested_date = frappe.datetime.obj_to_str(new_date);
              }
            });
            frm.refresh_field("fertilizer_plan");
          }
        },
      });
    }
  },

  plantation_date: function (frm) {
    // Plantation Date badalne pe dobara date calculate karo
    if (frm.doc.fertilizer_plan) {
      frm.doc.fertilizer_plan.forEach((row) => {
        if (row.days) {
          let plantation_date = frappe.datetime.str_to_obj(
            frm.doc.plantation_date
          );
          let new_date = frappe.datetime.add_days(plantation_date, row.days);
          row.suggested_date = frappe.datetime.obj_to_str(new_date);
        }
      });
      frm.refresh_field("fertilizer_plan");
    }
  },
});

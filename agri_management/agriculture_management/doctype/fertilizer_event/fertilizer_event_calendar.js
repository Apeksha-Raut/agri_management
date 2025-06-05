frappe.views.calendar["Fertilizer Event"] = {
  field_map: {
    start: "suggested_date",
    end: "suggested_date",
    id: "name",
    title: "fertilizer_name",
    allDay: "allDay",
  },

  order_by: "suggested_date",
  get_events_method: "frappe.desk.calendar.get_events",
};

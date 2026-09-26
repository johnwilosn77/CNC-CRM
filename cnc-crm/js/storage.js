(function () {
  const LEADS_KEY = "leadflow_leads_v1";
  const ACTIVITY_KEY = "leadflow_activity_v1";
  const USER_KEY = "leadflow_current_user_v1";

  const users = [
    { id: "admin-1", name: "Dev Admin", role: "admin" },
    { id: "generator-1", name: "Neha Generator", role: "lead_generator" },
    { id: "sales-1", name: "Rohan Sales", role: "salesperson" },
    { id: "sales-2", name: "Priya Sales", role: "salesperson" },
  ];

  const initialLeads = [
    {
      id: "lead-1001",
      name: "Aisha Khan",
      email: "aisha@example.com",
      phone: "+91 98765 41001",
      country: "India",
      company: "Northstar Media",
      source: "Website",
      service: "SEO Services",
      assignedTo: "sales-1",
      status: "Follow-up",
      followUpDate: getRelativeDate(1),
      notes: "Requested a proposal and case studies.",
      estimatedValue: 45000,
      finalValue: 0,
      createdBy: "generator-1",
      createdAt: getRelativeDateTime(-5),
      updatedAt: getRelativeDateTime(-1),
    },
    {
      id: "lead-1002",
      name: "Daniel Roy",
      email: "daniel@example.com",
      phone: "+91 98765 41002",
      country: "India",
      company: "BluePeak Retail",
      source: "LinkedIn",
      service: "Website Development",
      assignedTo: "sales-2",
      status: "Qualified",
      followUpDate: getRelativeDate(3),
      notes: "Decision expected after internal meeting.",
      estimatedValue: 80000,
      finalValue: 0,
      createdBy: "generator-1",
      createdAt: getRelativeDateTime(-4),
      updatedAt: getRelativeDateTime(-1),
    },
    {
      id: "lead-1003",
      name: "Meera Iyer",
      email: "meera@example.com",
      phone: "+91 98765 41003",
      country: "India",
      company: "GreenRoute Foods",
      source: "Referral",
      service: "Social Media Marketing",
      assignedTo: "sales-1",
      status: "Converted",
      followUpDate: "",
      notes: "Converted to a three-month package.",
      estimatedValue: 60000,
      finalValue: 54000,
      createdBy: "admin-1",
      createdAt: getRelativeDateTime(-10),
      updatedAt: getRelativeDateTime(-2),
    },
    {
      id: "lead-1004",
      name: "Kabir Shah",
      email: "kabir@example.com",
      phone: "+91 98765 41004",
      country: "UAE",
      company: "Orbit Charging",
      source: "Google Ads",
      service: "Content Marketing",
      assignedTo: "",
      status: "New",
      followUpDate: getRelativeDate(2),
      notes: "Needs pricing information.",
      estimatedValue: 30000,
      finalValue: 0,
      createdBy: "generator-1",
      createdAt: getRelativeDateTime(-1),
      updatedAt: getRelativeDateTime(-1),
    },
  ];

  function getRelativeDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function getRelativeDateTime(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  function read(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      console.warn("Could not read CRM data:", error);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initialize() {
    if (!localStorage.getItem(LEADS_KEY)) write(LEADS_KEY, initialLeads);
    if (!localStorage.getItem(ACTIVITY_KEY)) {
      write(ACTIVITY_KEY, [
        {
          id: crypto.randomUUID(),
          leadId: "lead-1003",
          action: "Lead converted",
          detail: "Final sales amount recorded as ₹54,000.",
          userId: "sales-1",
          timestamp: getRelativeDateTime(-2),
        },
        {
          id: crypto.randomUUID(),
          leadId: "lead-1002",
          action: "Status updated",
          detail: "Lead moved to Qualified.",
          userId: "sales-2",
          timestamp: getRelativeDateTime(-1),
        },
      ]);
    }
    if (!localStorage.getItem(USER_KEY)) localStorage.setItem(USER_KEY, "admin-1");
  }

  window.crmStorage = {
    users,
    initialize,
    getLeads: () => read(LEADS_KEY, []),
    saveLeads: (leads) => write(LEADS_KEY, leads),
    getActivity: () => read(ACTIVITY_KEY, []),
    saveActivity: (activity) => write(ACTIVITY_KEY, activity),
    getCurrentUserId: () => localStorage.getItem(USER_KEY) || "admin-1",
    setCurrentUserId: (id) => localStorage.setItem(USER_KEY, id),
  };
})();

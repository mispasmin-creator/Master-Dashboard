// ============================================
// DUMMY FRONTEND - HARDCODED SYSTEMS
// No backend connection required
// ============================================

// Hardcoded Systems Data
let HARDCODED_SYSTEMS = [
    { id: 1, systems: "Purchase FMS", link: "https://purchase-ten.vercel.app/" },
    { id: 2, systems: "Production Planning", link: "https://v0-production-planning-app-beta.vercel.app/" },
    { id: 3, systems: "Store FMS", link: "https://store-fms-botivate.vercel.app/" },
    { id: 4, systems: "Checklist Delegation", link: "https://botivatechecklist-delegation.vercel.app/" },
    { id: 5, systems: "HR Product", link: "https://botivate-hr-product.vercel.app/" },
    { id: 6, systems: "Maintenance", link: "https://new-demo-maintenance.vercel.app/" },
    { id: 7, systems: "MIS Dashboard", link: "https://demo-mis.vercel.app/" },
    { id: 8, systems: "Repair Management", link: "https://botivate-repair.vercel.app/" },
    { id: 9, systems: "Subscription Manager", link: "https://botivate-subscription-manager.vercel.app/" },
    { id: 10, systems: "Document Manager", link: "https://v0-document-manager-app.vercel.app/" },
    { id: 11, systems: "Lead to Order", link: "https://lead-to-order-system.vercel.app/" },
    { id: 12, systems: "NBD CRR Software", link: "https://v0-nbd-crr-software.vercel.app/" },
    { id: 13, systems: "Retail Management", link: "https://botivate-retail.vercel.app/" },
    { id: 14, systems: "Inventory Management", link: "https://botivate-inventory.vercel.app/" },
    { id: 15, systems: "Analytics Dashboard", link: "https://exquisite-monstera-3b8503.netlify.app/" },
    { id: 16, systems: "Business Intelligence", link: "https://v0-business-intelligence-dashboard-three.vercel.app/" },
    { id: 17, systems: "TMT Production Setup", link: "https://v0-tmt-production-setup.vercel.app/" },
    { id: 18, systems: "O2D System", link: "https://botivate-o2-d.vercel.app/" },
    { id: 19, systems: "Order to Dispatch", link: "https://dummy-order2dispatch.vercel.app/" },
    { id: 20, systems: "OCR Google Search", link: "https://internsatbotivate.github.io/BotivateOCR_GoogleSearch/" },
    { id: 21, systems: "BotiScan", link: "https://botiscan.vercel.app/" },
    { id: 22, systems: "Furniture App", link: "https://furniture-app-beryl.vercel.app/" },
    { id: 23, systems: "New Inventory", link: "https://new-inventory-lime.vercel.app/" },
    { id: 24, systems: "Accounts FMS", link: "https://v0-accounts-fms-system.vercel.app/" },
    { id: 25, systems: "Freight FMS", link: "https://v0-freight-fms-build.vercel.app/" },
    { id: 26, systems: "Akshay Portfolio", link: "https://akshay-baradia-porfile.vercel.app/" },
    { id: 27, systems: "Thoughtly AI", link: "https://www.thoughtly.com/" },
];

/**
 * GET all systems (returns hardcoded data)
 */
export const fetchSystemsApi = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return HARDCODED_SYSTEMS;
};

/**
 * CREATE system (adds to local array)
 */
export const createSystemApi = async (payload) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newSystem = {
        id: HARDCODED_SYSTEMS.length + 1,
        systems: payload.systems,
        link: payload.link || ""
    };
    HARDCODED_SYSTEMS.push(newSystem);
    return newSystem;
};

/**
 * UPDATE system (updates local array)
 */
export const updateSystemApi = async (id, payload) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = HARDCODED_SYSTEMS.findIndex(s => s.id === id);
    if (index !== -1) {
        HARDCODED_SYSTEMS[index] = { ...HARDCODED_SYSTEMS[index], ...payload };
        return HARDCODED_SYSTEMS[index];
    }
    throw new Error("System not found");
};

/**
 * DELETE system (removes from local array)
 */
export const deleteSystemApi = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    HARDCODED_SYSTEMS = HARDCODED_SYSTEMS.filter(s => s.id !== id);
    return { success: true };
};

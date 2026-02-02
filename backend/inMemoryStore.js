const bcrypt = require('bcryptjs');

// Simple in-memory store for demo purposes
const donors = [];
const hospitals = [];
const requests = [];

// Simple inventory map per hospital id: { HOSP001: { 'A+': 10, ... } }
const inventory = {};

async function ensureSampleUsers() {
    if (donors.length === 0) {
        const pwd = await bcrypt.hash('password', 10);
        donors.push({
            id: 'DEMO001',
            name: 'Demo Donor',
            email: 'demo@donor.com',
            password: pwd,
            phone: '+10000000000',
            bloodGroup: 'O+',
        });
    }
    if (hospitals.length === 0) {
        const pwd = await bcrypt.hash('password', 10);
        hospitals.push({
            id: 'HOSP001',
            name: 'Demo Hospital',
            email: 'hospital@example.com',
            password: pwd,
            phone: '+10000000001',
        });
        // initialize inventory for demo hospital
        inventory['HOSP001'] = {
            'A+': 10,
            'A-': 4,
            'B+': 8,
            'B-': 2,
            'AB+': 3,
            'AB-': 1,
            'O+': 12,
            'O-': 5,
        };
    }
}

function saveDonor(donor) {
    donors.push(donor);
    return donor;
}

function saveHospital(hospital) {
    hospitals.push(hospital);
    return hospital;
}

function findDonorByEmail(email) {
    if (!email) return null;
    return donors.find((d) => d.email === email.toLowerCase()) || null;
}

function findDonorById(id) {
    if (!id) return null;
    return donors.find(d => (d.id || '').toUpperCase() === (id || '').toUpperCase()) || null;
}

function findHospitalById(id) {
    if (!id) return null;
    return hospitals.find((h) => h.id === id.toUpperCase()) || null;
}

function listAll() {
    return { donors, hospitals };
}

// Requests helpers
function saveRequest(req) {
    requests.push({ ...req, createdAt: new Date(), updatedAt: new Date() });
    return requests[requests.length - 1];
}

function findAllRequests() {
    // return copy sorted desc by createdAt
    return [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findRequestsByHospitalId(hospitalId) {
    return requests.filter(r => (r.hospitalId || '').toUpperCase() === (hospitalId || '').toUpperCase())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function findRequestsByBloodGroup(bloodGroup) {
    if (!bloodGroup) return [];
    return requests.filter(r => r.bloodGroup === bloodGroup).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateRequestStatus(id, status) {
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    requests[idx].status = status;
    requests[idx].updatedAt = new Date();
    return requests[idx];
}

function deleteRequest(id) {
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) return false;
    requests.splice(idx, 1);
    return true;
}

// Inventory helpers
function getInventoryForHospital(hospitalId) {
    if (!hospitalId) return null;
    return inventory[hospitalId.toUpperCase()] || null;
}

function adjustInventory(hospitalId, bloodGroup, delta) {
    const hid = hospitalId.toUpperCase();
    inventory[hid] = inventory[hid] || {};
    inventory[hid][bloodGroup] = (inventory[hid][bloodGroup] || 0) + delta;
    if (inventory[hid][bloodGroup] < 0) inventory[hid][bloodGroup] = 0;
    return inventory[hid];
}

module.exports = {
    ensureSampleUsers,
    saveDonor,
    saveHospital,
    findDonorByEmail,
    findDonorById,
    findHospitalById,
    listAll,
    // requests
    saveRequest,
    findAllRequests,
    findRequestsByHospitalId,
    findRequestsByBloodGroup,
    updateRequestStatus,
    deleteRequest,
    // inventory
    getInventoryForHospital,
    adjustInventory,
};

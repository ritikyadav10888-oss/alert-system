export interface TurfManager {
    name: string;
    phone: string;
    role: string;
}

export const LOCATION_MANAGERS: Record<string, TurfManager> = {
    'Thane': {
        name: 'Rahul More',
        phone: '+91 98XXX XXXXX',
        role: 'Senior Manager'
    },
    'Baner': {
        name: 'Amit Patil',
        phone: '+91 97XXX XXXXX',
        role: 'Site Supervisor'
    },
    'Model Coloney': {
        name: 'Suresh Raina',
        phone: '+91 96XXX XXXXX',
        role: 'Owner'
    },
    'Dahisar': {
        name: 'Vikram Singh',
        phone: '+91 95XXX XXXXX',
        role: 'Night Manager'
    },
    'Borivali': {
        name: 'Karan Shah',
        phone: '+91 94XXX XXXXX',
        role: 'Manager'
    },
    'Andheri': {
        name: 'Priya Verma',
        phone: '+91 93XXX XXXXX',
        role: 'Admin'
    },
    'Matoshree': {
        name: 'Sunil Deshmukh',
        phone: '+91 92XXX XXXXX',
        role: 'Operations Head'
    }
};

export const getManagerForLocation = (location: string): TurfManager => {
    return LOCATION_MANAGERS[location] || {
        name: 'General Manager',
        phone: 'Contact Admin',
        role: 'System'
    };
};

'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'Power BI', url: 'https://powerbi.microsoft.com', description: 'Microsoft business analytics with interactive dashboards', icon: '📊', tags: ['Analytics', 'Microsoft'], free: false },
    { name: 'Tableau Public', url: 'https://public.tableau.com', description: 'Free data visualization platform — create interactive charts', icon: '📈', tags: ['Visualization', 'Free Tier'], free: true },
    { name: 'Google Looker Studio', url: 'https://lookerstudio.google.com', description: 'Free dashboard and reporting tool from Google', icon: '📉', tags: ['Dashboard', 'Google'], free: true },
    { name: 'Metabase', url: 'https://metabase.com', description: 'Open-source BI tool — ask questions about your data', icon: '🔍', tags: ['BI', 'Open Source'], free: true },
    { name: 'Mixpanel', url: 'https://mixpanel.com', description: 'Product analytics to understand user behavior', icon: '📱', tags: ['Analytics', 'Product'], free: true },
    { name: 'Airtable', url: 'https://airtable.com', description: 'Spreadsheet-database hybrid for organizing anything', icon: '📋', tags: ['Database', 'Spreadsheet'], free: true },
    { name: 'Odoo', url: 'https://odoo.com', description: 'All-in-one business suite — CRM, accounting, inventory, HR', icon: '🏢', tags: ['ERP', 'CRM'], free: true },
    { name: 'Notion', url: 'https://notion.so', description: 'All-in-one workspace for notes, docs, wikis, and projects', icon: '📓', tags: ['Workspace', 'Docs'], free: true },
    { name: 'Plausible', url: 'https://plausible.io', description: 'Privacy-friendly Google Analytics alternative', icon: '📊', tags: ['Analytics', 'Privacy'], free: false },
    { name: 'n8n', url: 'https://n8n.io', description: 'Workflow automation tool — connect apps and automate tasks', icon: '⚡', tags: ['Automation', 'Workflow'], free: true },
];

export default function BusinessHub() {
    return <ServiceHub title="Business & Analytics Hub" subtitle="Analytics, BI tools, and business management platforms"
        gradient="from-amber-600 to-orange-700" headerIcon="💼" services={services} />;
}

import React from 'react';
import Header from '../components/layout/Header';
import SidebarMenu from '../components/layout/SidebarMenu';
import StatsCard from '../components/dashboard/StatsCard';
import TransactionsTable from '../components/dashboard/TransactionsTable';

function DashboardPage() {
    return (
        <div className="drawer drawer-mobile">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                <Header />
                {/* Content here */}
                <StatsCard title="Total Page Views" value="89,400" description="21% more than last month" />
                <TransactionsTable />
                {/* More components */}
            </div>
            <SidebarMenu />
        </div>
    );
}

export default DashboardPage;

import { Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

export interface RouterTab {
  label: string;
  link: string;
}

export interface RouterTabsProps {
  children?: React.ReactNode;
  tabs: RouterTab[];
  depth: number;
}

export default function RouterTabs({ tabs, depth }: RouterTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    const currentTab = location.pathname.split('/')[depth];
    setCurrentTab(currentTab || null);
  }, [location]);

  return (
    <>
      <Tabs value={currentTab} onChange={(value) => navigate(`./${value}`)}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.link} value={tab.link}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet />
    </>
  );
}


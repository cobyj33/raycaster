import React  from 'react';
import { Outlet } from 'react-router-dom';
import { AppStatefulState } from 'App';
import { PageLayout } from 'PageLayout';

const acceptedMenus = ["Game Map", "Camera View", "Editor"] as const;
export type Menus = typeof acceptedMenus[number];

function Page(appState: AppStatefulState) {
  return (
    <PageLayout appState={appState}>
        <Outlet />
    </PageLayout>
  );
}



export default Page;

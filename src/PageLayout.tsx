import { AppStatefulState } from 'App'
import appStyles from 'App.module.css';
import NavBar from 'NavBar'
import React from 'react'

export const PageLayout = ({ appState, children }: { appState: AppStatefulState, children: React.ReactNode }) => {
  return (
    <div className={appStyles["app"]} tabIndex={0} >
      <NavBar {...appState}/>
      <div className={`${appStyles["viewing-area"]} ${appStyles["single"]}`}>
        { children }
      </div>
    </div>
  )
}

import React from 'react'
import { AiFillCamera, AiFillBook, AiOutlineSplitCells, AiFillSave, AiOutlineImport, AiFillFileAdd  } from 'react-icons/ai';
import { BsFillMapFill, BsFillPaletteFill } from "react-icons/bs"
import { BiHelpCircle } from "react-icons/bi"
import { AppStatefulState, createNewAppState, setNewAppState, STARTING_MAP_DIMENSIONS } from 'App';
import appStyles from 'App.module.css';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';


export const NavBar = (appState: AppStatefulState) => {
  return (
    <nav className={appStyles["nav-bar"]}>

        <NavButtonGroup> {/* Main Pages */}
          <NavLink to={"/camera"}><AiFillCamera /></NavLink>
          <NavLink to={"/bird"}><BsFillMapFill /></NavLink>
          <NavLink to={"/editor"}><BsFillPaletteFill /></NavLink>
          {/* <button className={appStyles["nav-button"]}><BiHelpCircle /></button>
          <button className={appStyles["nav-button"]}><AiFillBook /></button> */}
        </NavButtonGroup>

        <NavButtonGroup> {/* Help Pages */}
          <NavLink to={"/camera/help"}><BiHelpCircle /> <AiFillCamera /></NavLink>
          <NavLink to={"/bird/help"}><BiHelpCircle /> <BsFillMapFill /></NavLink>
          <NavLink to={"/editor/help"}><BiHelpCircle /> <BsFillPaletteFill /></NavLink>
        </NavButtonGroup>

        <NavButtonGroup> {/* Actions Manipulation */}
          <NavButton onClick={(() => setNewAppState(STARTING_MAP_DIMENSIONS, appState))}><AiFillFileAdd /></NavButton>
          {/* <button className={appStyles["nav-button"]} onClick={save}><AiFillSave /></button>
          <button className={appStyles["nav-button"]} onClick={load}><AiOutlineImport /></button> */}
        </NavButtonGroup>
      </nav>
  )
}

function NavButtonGroup({ children }: { children: React.ReactNode }) {
    return <section className={appStyles["nav-button-group"]}>{children}</section>
}

function NavButton(props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
    return <button {...props} className={appStyles["nav-button"]} />
}

interface SelectableNavButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> { selected: boolean }
function SelectableNavButton({ selected, ...props }: SelectableNavButtonProps) {
    return <button {...props} className={`${appStyles["nav-button"]} ${selected ? appStyles["selected"] : ""}`} />
}

interface NavLinkProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> { to: string }
function NavLink({ to, ...props }: NavLinkProps ) {
    const path = useResolvedPath(to)
    const matches = useMatch(path.pathname)
    function isOnLinkedPage(): boolean {
        if (matches !== null && matches !== undefined) {
            return matches.pathname === path.pathname
        }
        return false;
    }

    return (
    <Link to={to}>
        <SelectableNavButton selected={isOnLinkedPage()} {...props} />
    </Link>
    )
}

export default NavBar
  
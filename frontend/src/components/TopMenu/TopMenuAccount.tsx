import React, { useState, Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/actions/account.actions";
import { IStateType } from "../../store/models/root.interface";
import useSession from 'react-session-hook';

function TopMenuAccount(): React.ReactElement {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const email: string = useSelector((state: IStateType) => state.account.email);
    const [isShow, setShow] = useState(false);
    const session = useSession();

    return (
        <li className="nav-item dropdown no-arrow">
            <a className="nav-link dropdown-toggle"
               onClick={() => { setShow(!isShow); }}
               href="# "
               id="userDropdown"
               role="button"
               data-bs-toggle="dropdown"
               aria-haspopup="true"
               aria-expanded="false">
                <span className="me-2 d-none d-lg-inline small cadet">{email}</span>
                <img className="img-profile rounded-circle" alt=""
                     src="https://source.unsplash.com/QAB-WJcbgJk/60x60" />
            </a>

            <div className={`dropdown-menu dropdown-menu-end shadow animated--grow-in ${(isShow) ? "show" : ""}`}
                 aria-labelledby="userDropdown">
                <a className="dropdown-item"
                   onClick={() => {
                       dispatch(logout());
                       session.removeSession();
                       navigate('/login');
                   }}
                   href="# ">
                    <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i>
                    Logout
                </a>
            </div>
        </li>
    );
}

export default TopMenuAccount;

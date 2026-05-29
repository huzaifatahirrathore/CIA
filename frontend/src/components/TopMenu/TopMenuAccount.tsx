import React, { useState, Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/actions/account.actions";
import { IStateType } from "../../store/models/root.interface";

function TopMenuAccount(): React.ReactElement {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const email: string = useSelector((state: IStateType) => state.account.email);
    const [isShow, setShow] = useState(false);

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
                <i className="fas fa-user-circle fa-2x" style={{color: 'cadetblue'}}></i>
            </a>

            <div className={`dropdown-menu dropdown-menu-end shadow animated--grow-in ${(isShow) ? "show" : ""}`}
                 data-bs-popper="none"
                 aria-labelledby="userDropdown">
                <a className="dropdown-item"
                   onClick={async () => {
                       await dispatch(logout());
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

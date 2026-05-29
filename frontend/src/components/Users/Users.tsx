import React, {Fragment, Dispatch, useEffect} from "react";
import TopCard from "../../common/components/TopCard";
import { IUser } from "../../store/models/user.interface";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import {addAdmin, getUsers, removeAdmin} from "../../store/actions/users.action";
import { updateCurrentPath } from "../../store/actions/root.actions";
import Moment from "react-moment";

const Users: React.FC = () => {

    const dispatch: Dispatch<any> = useDispatch();
    dispatch(updateCurrentPath("user", "list"));

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const users: IUser[] = useSelector((state: IStateType) => state.users.users);
    const admins: IUser[] = useSelector((state: IStateType) => state.users.admins);
    const isAdmin: boolean = useSelector((state: IStateType) => state.account.role === "ADMIN");
    const isLastAdmin: boolean = admins.length <= 1;

    function setUserAdmin(user: IUser): void {
        dispatch(addAdmin(user));
    }

    function setUserNotAdmin(admin: IUser): void {
        dispatch(removeAdmin(admin));
    }

    const adminElements: React.ReactElement[] = admins.map(admin => (
        <tr className="table-row" key={`admin_${admin.id}`}>
            <th scope="row">{admin.id}</th>
            <td>{admin.username}</td>
            <td>{admin.role}</td>
            <td><Moment fromNow={true}>{admin.updatedAt}</Moment></td>
            <td><Moment fromNow={true}>{admin.createdAt}</Moment></td>
            {isAdmin && (
                <td>
                    {!isLastAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => setUserNotAdmin(admin)}>
                            Revert admin
                        </button>
                    )}
                </td>
            )}
        </tr>
    ));

    const userElements: React.ReactElement[] = users.map(user => (
        <tr className="table-row" key={`user_${user.id}`}>
            <th scope="row">{user.id}</th>
            <td>{user.username}</td>
            <td>{user.role}</td>
            <td><Moment fromNow={true}>{user.updatedAt}</Moment></td>
            <td><Moment fromNow={true}>{user.createdAt}</Moment></td>
            {isAdmin && (
                <td>
                    <button className="btn btn-success btn-sm" onClick={() => setUserAdmin(user)}>
                        Set admin
                    </button>
                </td>
            )}
        </tr>
    ));

    return (
        <Fragment>
            <h1 className="h3 mb-2 text-gray-800">Users</h1>
            <p className="mb-4">Users here</p>

            <div className="row">
                <TopCard title="ADMINS" text={admins.length.toString()} icon="user-tie" class="primary" />
                <TopCard title="USERS" text={users.length.toString()} icon="user" class="danger" />
            </div>

            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 fw-bold text-green">Admin List</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive portlet">
                                <table className="table">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Username</th>
                                            <th scope="col">Role</th>
                                            <th scope="col">Updated at</th>
                                            <th scope="col">Created at</th>
                                            {isAdmin && <th scope="col">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminElements}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 fw-bold text-green">User List</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive portlet">
                                <table className="table">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">Username</th>
                                            <th scope="col">Role</th>
                                            <th scope="col">Updated at</th>
                                            <th scope="col">Created at</th>
                                            {isAdmin && <th scope="col">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userElements}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Users;

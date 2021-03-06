import React from "react";
import { axiosInstance } from "../app";
import { statusText, statusLabel } from "../common/utils";
import PrintingCard from "./statusCards/printing";
import PendPayCard from "./statusCards/pendpay";
import PickupCard from "./statusCards/pickup";
import TransitCard from "./statusCards/transit";

class FileStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastAttempt: null,
        };
    }

    fetchAttemptData = () => {
        axiosInstance.get("/attempts/" + this.props.file.printing.attemptIDs.slice(-1).pop()).then((res) => {
            this.setState({
                lastAttempt: res.data,
            });
        });
    };

    render() {
        let file = this.props.file;
        let submission = this.props.submission;

        const statusBody = () => {
            switch (file.status) {
                case "PENDING_PAYMENT":
                    return <PendPayCard file={file} submission={submission} user={this.props.user} />;
                case "READY_TO_PRINT":
                    return null;
                case "PRINTING":
                    if (!this.state.lastAttempt) {
                        this.fetchAttemptData();
                    } else {
                        let attempt = this.state.lastAttempt;
                        return <PrintingCard attempt={attempt} user={this.props.user} />;
                    }

                case "IN_TRANSIT":
                    if (!this.state.lastAttempt) {
                        this.fetchAttemptData();
                    } else {
                        let attempt = this.state.lastAttempt;
                        return (
                            <TransitCard file={file} submission={submission} attempt={attempt} user={this.props.user} />
                        );
                    }
                case "WAITING_FOR_PICKUP":
                    if (!this.state.lastAttempt) {
                        this.fetchAttemptData();
                    } else {
                        let attempt = this.state.lastAttempt;
                        return (
                            <PickupCard file={file} submission={submission} attempt={attempt} user={this.props.user} />
                        );
                    }
                case "PICKED_UP":
                    return (
                        <div className="card-body">
                            <div></div>
                        </div>
                    );
                case "REJECTED":
                    return (
                        <div className="card-body">
                            <div></div>
                        </div>
                    );
                case "STALE_ON_PAYMENT":
                    return (
                        <div className="card-body">
                            <div></div>
                        </div>
                    );
                case "REPOSESSED":
                    return (
                        <div className="card-body">
                            <div></div>
                        </div>
                    );
                case "LOST_IN_TRANSIT":
                    return (
                        <div className="card-body">
                            <div></div>
                        </div>
                    );
                default:
                    return (
                        <div className="card-body">
                            <p>Something is terribly wrong here...</p>
                        </div>
                    );
            }
        };

        return (
            <div className="card shadow mb-3">
                <div className="card-body">
                    <h3>
                        Status: <span className={"fw-bold " + statusText(file)}>{statusLabel(file)}</span>
                    </h3>
                    {statusBody()}
                </div>
            </div>
        );
    }
}

export default FileStatus;

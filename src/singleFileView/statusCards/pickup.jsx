import React from "react";
import FormattedDate from "../../common/formattedDate";
import FormattedShortDate from "../../common/formattedShortDate";
import { statusText } from "../../common/utils";
import PickupModal from "../pickupModal";
import { withRouter } from "react-router-dom";

class PendingCard extends React.Component {
    constructor(props) {
        super(props);
        this.pickupModal = React.createRef();
    }

    reloadPage = () => {
        this.props.history.go(0);
    };

    openPickupModal = () => {
        let fileIDs = [];
        fileIDs.push(this.props.file._id);
        this.pickupModal.current.openModal(fileIDs);
    };

    render() {
        let submission = this.props.submission;
        let file = this.props.file;
        let todayLate = new Date();
        todayLate.setHours(23, 59, 59, 0);

        const submissionCompleteAlert = () => {
            if (new Date(submission.pickup.timestampPickupRequested) < new Date("1980")) {
                return (
                    <div className="alert alert-purple" role="alert">
                        <h4 className="alert-heading">
                            <i className="bi bi-exclamation-circle-fill"></i> Submission Incomplete!
                        </h4>
                        <p>
                            Not all files in this submission have finished printing and/or arrived at requested pickup
                            location!
                        </p>
                        <hr />
                        <p className="mb-0">
                            Patron has <strong>not</strong> been notified to pick up their prints yet. Patron may be
                            allowed to pick up completed files early.
                        </p>
                    </div>
                );
            } else {
                return (
                    <div className="alert alert-green" role="alert">
                        <h4 className="alert-heading">
                            <i className="bi bi-check-circle-fill"></i> Submission Complete!
                        </h4>
                        <p className="mb-0">Patron has been notified to pick up their prints.</p>
                    </div>
                );
            }
        };

        const completedRow = () => {
            if (new Date(submission.pickup.timestampPickupRequested) > new Date("1980")) {
                return (
                    <tr>
                        <th scope="row">Submission Completed:</th>
                        <td>
                            <FormattedDate date={submission.pickup.timestampPickupRequested} />
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        };

        const firstWarning = () => {
            if (todayLate > new Date(submission.pickup.timestampFirstWarning)) {
                return (
                    <tr>
                        <th scope="row">First Warning:</th>
                        <td>
                            <FormattedShortDate date={submission.pickup.timestampFirstWarning} />
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        };

        const finalWarning = () => {
            if (todayLate > new Date(submission.pickup.timestampFinalWarning)) {
                return (
                    <tr>
                        <th scope="row">Final Warning:</th>
                        <td>
                            <FormattedShortDate date={submission.pickup.timestampFinalWarning} />
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        };

        const reposession = () => {
            if (todayLate > new Date(submission.pickup.timestampReposessed)) {
                return (
                    <tr>
                        <th scope="row">Reposession:</th>
                        <td>
                            <FormattedShortDate date={submission.pickup.timestampReposessed} />
                        </td>
                    </tr>
                );
            } else {
                return null;
            }
        };

        return (
            <React.Fragment>
                <h5 className="text-muted mb-3">
                    File printed on <FormattedDate date={file.printing.timestampPrinted} />
                </h5>
                {submissionCompleteAlert()}
                <div className="d-grid">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            this.openPickupModal();
                        }}>
                        <i className="bi bi-person-check"></i>Picking Up?
                    </button>
                </div>

                <hr />
                <table className="table">
                    <tbody>
                        <tr>
                            <th scope="row">File Printed:</th>
                            <td>
                                <FormattedDate date={file.printing.timestampPrinted} />
                            </td>
                        </tr>
                        {completedRow()}
                        {firstWarning()}
                        {finalWarning()}
                        {reposession()}
                    </tbody>
                </table>

                <PickupModal ref={this.pickupModal} reloadPage={this.reloadPage.bind(this)} />
            </React.Fragment>
        );
    }
}

export default withRouter(PendingCard);

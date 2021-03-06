import React from "react";
import { Link } from "react-router-dom";
import FormattedDate from "../../common/formattedDate";
import { statusText } from "../../common/utils";

class PrintingCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let attempt = this.props.attempt;
        return (
            <React.Fragment>
                <h5 className="text-muted">Attempt ID: {attempt.prettyID}</h5>
                <table className="table">
                    <tbody>
                        <tr>
                            <th scope="row" className="text-muted">
                                Started At
                            </th>
                            <td>
                                <strong>
                                    <FormattedDate date={attempt.timestampStarted} />
                                </strong>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="text-muted">
                                Started By
                            </th>
                            <td>
                                <strong>{attempt.startedByName}</strong> ({attempt.startedByEUID})
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="text-muted">
                                Printer
                            </th>
                            <td>
                                <strong>{attempt.printerName}</strong> @ {attempt.location}
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="text-muted">
                                Filament
                            </th>
                            <td>
                                <strong>{attempt.rollID}</strong> @ {attempt.startWeight}g
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="text-muted">
                                All Files in Attempt ({attempt.fileIDs.length})
                            </th>
                            <td>
                                {attempt.fileNames.map((name, index) => {
                                    return <p className="mb-0">{name}</p>;
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Link to="/printers" className="w-100">
                    <button className="btn btn-blue w-100">Go to the Printer Dashboard</button>
                </Link>
            </React.Fragment>
        );
    }
}

export default PrintingCard;

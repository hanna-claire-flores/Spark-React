import React from "react";
import { axiosInstance } from "../app";
import { parseGcode } from "./res/gcodeAnalyzer";
import ParseModal from "./gcodeParseModal";
import UploadModal from "./submitReviewModal";
import "./scss/review.scss";
import { Modal } from "bootstrap";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

class ReviewForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            descision: props.file.review.decision || "Accepted",
            autoParse: true,
            show: false,
            gcode: null,
            slicedHours: 0,
            slicedMinutes: 0,
            slicedGrams: 0,
            slicedPrinter: null,
            slicedMaterial: null,
            patronNotes: null,
            internalNotes: null,
            timestampReviewed: null,
            parseResults: null,
        };
        this.parseModal = React.createRef();
        this.uploadModal = React.createRef();
        this.handleDescisionChange = this.handleDescisionChange.bind(this);
        this.handleGcodeUpload = this.handleGcodeUpload.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.parseModalBS = new Modal(this.parseModal.current);
        this.uploadModalBS = new Modal(this.uploadModal.current);
    }

    componentDidUpdate() {
        this.parseModalBS = new Modal(this.parseModal.current);
        this.uploadModalBS = new Modal(this.uploadModal.current);
    }

    handleDescisionChange(e) {
        this.setState({
            descision: e.target.value,
        });
    }

    handleGcodeUpload(e) {
        var file = e.target.files[0];
        if (file.name.slice(-5).toLowerCase() === "gcode") {
            if (file.size < 10000000) {
                //10MB
                if (this.state.autoParse) {
                    let inst = Modal.getInstance(this.parseModal.current);
                    this.parseModal.current.addEventListener("shown.bs.modal", (e) => {
                        var fileReader = new FileReader();
                        fileReader.onloadend = () => {
                            var content = fileReader.result;
                            parseGcode(content).then((output) => {
                                inst.hide();
                                var results = output;
                                var printSeconds = results.printTime;
                                var hours = Math.floor(printSeconds / 3600);
                                printSeconds %= 3600;
                                var minutes = Math.floor(printSeconds / 60);

                                this.setState({
                                    parseResults: results,
                                    slicedGrams: Math.round(results.plaWeight),
                                    slicedHours: hours,
                                    slicedMinutes: minutes,
                                    slicedPrinter: results.extractedPrinter,
                                    slicedMaterial: results.extractedFilament,
                                });
                            });
                        };
                        fileReader.readAsText(file);
                    });
                    inst.show();
                }
            } else {
                toast.warn("GCODE file too big to parse automatically!", { position: "bottom-right" });
            }
        } else {
            toast.info("This isn't a GCODE file, are you sure this is correct?", {
                position: "bottom-right",
            });
        }

        this.setState({
            gcode: file,
        });
    }

    handleSubmit() {
        let now = new Date();
        const data = new FormData();
        let jsonObject = {
            review: {
                descision: this.state.descision,
                timestampReviewed: now,
                patronNotes: this.state.patronNotes,
                slicedHours: this.state.slicedHours,
                slicedMinutes: this.state.slicedMinutes,
                slicedGrams: this.state.slicedGrams,
                slicedPrinter: this.state.slicedPrinter,
                slicedMaterial: this.state.slicedMaterial,
            },
            newInternalNote: {
                dateAdded: now,
                notes: this.state.internalNotes,
            },
        };
        data.append("jsonData", JSON.stringify(jsonObject));
        data.append("files", this.state.gcode);

        axiosInstance.post("/submissions/review/" + this.props.file._id, data).then((res) => {
            console.log("done");
            this.props.history.go(0);
        });
    }

    render() {
        const acceptedControls = () => {
            if (this.state.descision === "Accepted") {
                return (
                    <div>
                        <h5>Slicing Details</h5>
                        <p className="small text-muted">
                            GCODE must contain <strong>ONE copy</strong> of the requested file. Duration and weight will
                            be calulated automatically.
                        </p>
                        <div className="mb-3">
                            <div className="input-group">
                                <input
                                    className={"form-control " + (this.state.gcode ? "is-valid" : "is-invalid")}
                                    type="file"
                                    id="gcodeFile"
                                    accept=".gcode"
                                    required
                                    onInput={(e) => {
                                        this.handleGcodeUpload(e);
                                    }}
                                />
                                <span className="input-group-text">
                                    <input
                                        className="form-check-input mt-0"
                                        type="checkbox"
                                        checked={this.state.autoParse}
                                        onChange={(e) => {
                                            this.setState({
                                                autoParse: !this.state.autoParse,
                                            });
                                        }}
                                    />
                                    <label className="form-check-label ms-2">Auto Parse</label>
                                </span>
                            </div>
                        </div>

                        <div className="row mb-1">
                            <div className="col">
                                <div className="form-floating mb-3">
                                    <input
                                        type="number"
                                        required
                                        value={this.state.slicedHours}
                                        onChange={(e) => {
                                            this.setState({
                                                slicedHours: e.target.value,
                                            });
                                        }}
                                        className={
                                            "form-control " +
                                            (this.state.slicedHours + this.state.slicedMinutes
                                                ? "is-valid"
                                                : "is-invalid")
                                        }
                                        placeholder="0"
                                    />
                                    <label>Hours</label>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-floating mb-3">
                                    <input
                                        type="number"
                                        required
                                        value={this.state.slicedMinutes}
                                        onChange={(e) => {
                                            this.setState({
                                                slicedMinutes: e.target.value,
                                            });
                                        }}
                                        className={
                                            "form-control " +
                                            (this.state.slicedHours + this.state.slicedMinutes
                                                ? "is-valid"
                                                : "is-invalid")
                                        }
                                        placeholder="0"
                                    />
                                    <label>Minutes</label>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-floating mb-3">
                                    <input
                                        type="number"
                                        required
                                        value={this.state.slicedGrams}
                                        onChange={(e) => {
                                            this.setState({
                                                slicedGrams: e.target.value,
                                            });
                                        }}
                                        className={
                                            "form-control " + (this.state.slicedGrams ? "is-valid" : "is-invalid")
                                        }
                                        placeholder="0"
                                    />
                                    <label>Weight</label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        required
                                        value={this.state.slicedPrinter}
                                        onChange={(e) => {
                                            this.setState({
                                                slicedPrinter: e.target.value,
                                            });
                                        }}
                                        className={
                                            "form-control " + (this.state.slicedPrinter ? "is-valid" : "is-invalid")
                                        }
                                    />
                                    <label>Printer</label>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        required
                                        value={this.state.slicedMaterial}
                                        onChange={(e) => {
                                            this.setState({
                                                slicedMaterial: e.target.value,
                                            });
                                        }}
                                        className={
                                            "form-control " + (this.state.slicedPrinter ? "is-valid" : "is-invalid")
                                        }
                                    />
                                    <label>Material</label>
                                </div>
                            </div>
                        </div>

                        <hr />
                    </div>
                );
            } else {
                return null;
            }
        };

        return (
            <div className="card shadow mb-3">
                <div className="card-body">
                    <form>
                        <div className="mb-3">
                            <h5>Review Decision</h5>
                            <select
                                className="form-select"
                                required
                                value={this.state.descision}
                                onChange={this.handleDescisionChange}>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <hr />

                        {acceptedControls()}

                        <div className="form-floating mb-3">
                            <textarea
                                className={
                                    "form-control floating-textarea " +
                                    (this.state.patronNotes ? "is-valid" : "is-invalid")
                                }
                                value={this.state.patronNotes}
                                required
                                onChange={(e) => {
                                    this.setState({
                                        patronNotes: e.target.value,
                                    });
                                }}></textarea>
                            <label>Notes to Patron</label>
                        </div>

                        <div className="form-floating mb-3">
                            <textarea
                                className={
                                    "form-control floating-textarea " +
                                    (this.state.internalNotes ? "is-valid" : "border-bsyellow")
                                }
                                value={this.state.internalNotes}
                                required
                                onChange={(e) => {
                                    this.setState({
                                        internalNotes: e.target.value,
                                    });
                                }}></textarea>
                            <label>Internal Notes</label>
                        </div>

                        <button
                            className="btn btn-primary float-end"
                            type="submit"
                            disabled={
                                !(
                                    this.state.gcode &&
                                    this.state.slicedGrams &&
                                    this.state.slicedHours + this.state.slicedMinutes &&
                                    this.state.slicedMaterial &&
                                    this.state.slicedPrinter &&
                                    this.state.patronNotes
                                )
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                this.handleSubmit();
                            }}>
                            Submit Review
                        </button>
                    </form>
                </div>

                <ParseModal ref={this.parseModal} />
                <UploadModal ref={this.uploadModal} />
            </div>
        );
    }
}

export default withRouter(ReviewForm);

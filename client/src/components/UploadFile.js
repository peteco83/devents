import React, { useState } from 'react';
import axios from 'axios';

// WIP ---- Not sure if this will work properly buuut 
export const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("choose image");
    const [uploadedFile, setUploadedFile] = useState({})

    const handleUpload = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        try {
            // need to check if the same route or what?
            const res = await axios.post('/upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const { fileName, filePath } = res.data;
            setUploadedFile({ fileName, filePath });

        } catch (err) {
            if (err.response.status === 500) {
                console.log("there was a problem");
            } else {
                console.log(err.response.data.msg);
            }
        }
    }


    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    className="img-input"
                    type="file"
                    onChange={handleUpload}
                />
                <label className="img-label">
                    {fileName}
                </label>

                <button type="submit" className="imag-btn">Upload image</button>
            </form>

            {uploadedFile ?
                <img src={uploadedFile.filePath} alt="Profile Picture" />
                :
                null}
        </div>
    )
}


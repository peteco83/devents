import React, { useState, useEffect, useContext } from 'react';
import Context from './Context';
import { useHistory } from 'react-router-dom';
import '../style/CarouselSlide.scss';

const CarouselSlide = ({ title, location, img, date, time, coordinates, description, url, authorId, _id }) => {
    const history = useHistory();

    const { setEventInfo } = useContext(Context);

    const [linkToEvent, setLinkToEvent] = useState(false)

    useEffect(() => {
        linkToEvent && history.push('/event');
    });

    return (
        <div className="slide-container" >
            <div className="oneSlide" style={{ backgroundImage: `url("http://localhost:4000${img}")` }}>
                <div className="slide-text">
                    <h2 className="titleAdvert">{title}</h2>
                    <p className="textAdvert">{location}</p>

                    <button className="button checkButton" onClick={() => {
                        setEventInfo(
                            {
                                title: title,
                                img: img,
                                date: date,
                                time: time,
                                location: location,
                                coordinates: coordinates,
                                description: description,
                                url: url,
                                authorId: authorId,
                                _id: _id
                            }
                        );
                        setLinkToEvent(true)
                    }}>Check it out!</button>
                </div>
            </div>
        </div>
    );
}

export default CarouselSlide;

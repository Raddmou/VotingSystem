import React, { useState, useContext } from "react";
import Card from "react-bootstrap/Card";
import { voterContext } from "./MainComponent";
import { providerContext } from "../App";

const InformationsComponent = (props) => {
    const provider = useContext(providerContext);
	const [isOwner, setIsOwner] = useState(props.isOwner);
    const voter = useContext(voterContext);

	if(!provider || !provider.accounts || !voter)
		return null;

    const getContent = () => {
        if(isOwner)
            return (
                <span >Wallet admin connected</span>
            );
        else
        {
            if(voter.isRegistered)
                return (
                    <div>
                        <span >Registered voter wallet connected</span>
                        <br></br>
                        <span >{voter.hasVoted ? " Already voted" : " Not voted yet"}</span>
                    </div>
                );
            else
            return (
                <span >Non registered voter wallet connected</span>
            );
        }
    };

	return ( 
        <div>
            <Card style={{ width: '40rem' }}>
                <Card.Header><strong>Informations</strong></Card.Header>
                <Card.Body>
                    {getContent()}
                    <br></br>
                    <span className="navConnected">Address {provider.accounts[0]} </span>
                </Card.Body>		
            </Card>
        </div>
	);
}

export default InformationsComponent;
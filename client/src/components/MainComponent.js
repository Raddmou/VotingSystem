import React, { Component, useState, useEffect, createContext, useContext } from "react";
import CurrentStatusComponent from "./CurrentStatusComponent";
import InformationsComponent from "./InformationsComponent";
import VotingComponents from "./VotingComponents";
import ResultsComponent from "./ResultsComponent";
import { providerContext } from "../App";

export const voterContext = createContext({isRegistered: false, hasVoted: false, votedProposalId: null});
export const statusContext = createContext({currentState: null});
export const proposalsContext = createContext([]);
export const winnerContext = createContext();

const MainComponent = (props) => {
    const provider = useContext(providerContext);
    const [isOwner, setIsOwner] = useState(null);
    const [currentState, setCurrentState] = useState(null);
    const [voter, setVoter] = useState(null);
    const [winner, setWinner] = useState(null);
    const [proposals, setProposals] = useState([]);    

	useEffect(async () => {
        await getCurrentVotingStatus();

		await getOwner();

        await getVoter(); 
        
        await getWinner();

        provider.contract.events.WorkflowStatusChanged(null, (error, event) => {
            if(!error){
                console.log("WorkflowStatusChanged");
                setCurrentState(event.returnValues.newStatus);
                getWinner();
            }
        });
        provider.contract.events.Voted(null, (error, event) => {
            if(!error){
                console.log("Voted");
                const hasVoted = (event.returnValues.voter == provider.accounts[0]);
                setVoter({hasVoted: hasVoted});
            }
        });

        // provider.contract.events.ProposalRegistered(null, async (error, event) => {
        //     if(!error){
        //         // const proposalId = event.returnValues.proposalId;
        //         // const proposalresponse = await provider.contract.methods.proposals(proposalId).call({from: provider.accounts[0]});
        //         // setProposals({proposalId: proposalId, proposalDescription: proposalresponse.description});
        //         console.log("ProposalRegistered");
        //         const idProposal = event.returnValues.proposalId;
        //         const proposalResponse = await provider.contract.methods.proposals(idProposal).call();
        //         const proposalToAdd = {proposalId: idProposal, proposalDescription: proposalResponse.description}
        //         if(proposals.indexOf(proposalResponse.description) == -1)
        //             setProposals(proposals => [...proposals, proposalToAdd]);  
        //     }
        // });

	}, []);

    

    const getVoter = async () => {
        try{
          const voterObject = await provider.contract.methods.voters(provider.accounts[0]).call({from: provider.accounts[0]});
          setVoter(voterObject);
        }
        catch(error){
          if(error){
            console.log(error);
          }
        }
    }

    const getOwner = async () => {
        try{
            const owner = await provider.contract.methods.owner().call();
            setIsOwner(owner === provider.accounts[0]);
        }
        catch(error){
          if(error){
            console.log(error);
          }
        }
    }

    const getWinner = async () => {
        try{

            const winnerResponse = await provider.contract.methods.getWinner().call();
            setWinner(winnerResponse);   
        }
        catch(error){
          if(error){
            console.log(error);
            setWinner({winnerProposalDescription: "No winner determinated"});
          }
        }
    }

    const getCurrentVotingStatus = async () => {
        try {
            const state = await provider.contract.methods.getCurrentVotingStatus().call();
            setCurrentState(state);
            if(state == '5')
            {
                await getWinner();
            }
        } catch (error) {
            console.log(error);
        } 
    };

    if (!provider || !currentState || isOwner == null)
        return null;

    return ( 
        <div>
            <div class="header-app">
                <h1>Voting System</h1>
            </div>
            <winnerContext.Provider value={winner}>
                <providerContext.Provider value={provider}>
                    <statusContext.Provider value={currentState}>
                        <proposalsContext.Provider value={proposals}>
                            <voterContext.Provider value={voter}>          
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <CurrentStatusComponent isOwner={isOwner} currentState={currentState} voter={voter}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <InformationsComponent isOwner={isOwner} voter={voter}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <VotingComponents isOwner={isOwner} currentState={currentState} proposals={proposals} voter={voter} winner={winner}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <ResultsComponent winner={winner}/>
                                </div>
                            </voterContext.Provider>
                        </proposalsContext.Provider>
                    </statusContext.Provider>
                </providerContext.Provider>
            </winnerContext.Provider>
        </div>
    );
}

export default MainComponent;
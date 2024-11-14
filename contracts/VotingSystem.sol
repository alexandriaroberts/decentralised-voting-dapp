// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Vote {
        string question;
        string[] options;
        mapping(uint => uint) voteCounts;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => Vote) public votes;
    uint public voteCount;

    event VoteCreated(uint voteId, string question, string[] options);
    event VoteCast(uint voteId, uint optionIndex, uint newCount);

    function createVote(string memory _question, string[] memory _options) public {
        require(_options.length > 1, "At least two options are required");
        
        uint voteId = voteCount++;
        Vote storage newVote = votes[voteId];
        newVote.question = _question;
        newVote.options = _options;

        emit VoteCreated(voteId, _question, _options);
    }

    function castVote(uint _voteId, uint _optionIndex) public {
        require(_voteId < voteCount, "Vote does not exist");
        require(_optionIndex < votes[_voteId].options.length, "Invalid option");
        require(!votes[_voteId].hasVoted[msg.sender], "Already voted");

        votes[_voteId].voteCounts[_optionIndex]++;
        votes[_voteId].hasVoted[msg.sender] = true;

        emit VoteCast(_voteId, _optionIndex, votes[_voteId].voteCounts[_optionIndex]);
    }

    function getVoteDetails(uint _voteId) public view returns (string memory, string[] memory, uint[] memory) {
        require(_voteId < voteCount, "Vote does not exist");
        
        Vote storage v = votes[_voteId];
        uint[] memory counts = new uint[](v.options.length);
        for (uint i = 0; i < v.options.length; i++) {
            counts[i] = v.voteCounts[i];
        }
        
        return (v.question, v.options, counts);
    }
}
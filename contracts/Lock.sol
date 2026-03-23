// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Insurance {

    struct Claim {
        address user;
        string reason;
        string status;
    }

    Claim[] public claims;

    function createClaim(string memory _reason) public {
        claims.push(Claim(msg.sender, _reason, "Pending"));
    }

    function approveClaim(uint index) public {
        claims[index].status = "Approved";
    }

    function getClaims() public view returns (Claim[] memory) {
        return claims;
    }
}
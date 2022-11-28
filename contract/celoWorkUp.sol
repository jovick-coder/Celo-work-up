// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);
    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract celoWorkUp {
    uint256 internal talentListLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Talent {
        address payable owner;
        string name;
        string priceType;
        string level;
        string skills;
        string description;
        string password;
        string date;
        uint256 price;
        uint256 hireCount;
    }

    mapping(uint256 => Talent) internal talentList;

    //Function to register talent
    function registerTalent(
        string memory _name,
        string memory _priceType,
        string memory _level,
        string memory _skills,
        string memory _description,
        string memory _password,
        string memory _date,
        uint256 _price
    ) public {
        uint256 _hireCount = 0;
        talentList[talentListLength] = Talent(
            payable(msg.sender),
            _name,
            _priceType,
            _level,
            _skills,
            _description,
            _password,
            _date,
            _price,
            _hireCount
        );
        talentListLength++;
    }

    //Function to get all registed talent
    function getTalentList(uint256 _index)
        public
        view
        returns (
            address payable a,
            string memory b,
            string memory c,
            string memory d,
            string memory e,
            string memory f,
            string memory g,
            string memory h,
            uint256 i,
            uint256 j
        )
    {
        a = talentList[_index].owner;
        b = talentList[_index].name;
        c = talentList[_index].priceType;
        d = talentList[_index].level;
        e = talentList[_index].skills;
        f = talentList[_index].description;
        g = talentList[_index].password;
        h = talentList[_index].date;
        i = talentList[_index].price;
        j = talentList[_index].hireCount;
    }

    //Function to hire talent
    function hireTalent(uint256 _index) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                talentList[_index].owner,
                talentList[_index].price
            ),
            "Transfer failed."
        );
        talentList[_index].hireCount++;
    }

    //Function to delete talent profile
    function deleteProfile(uint256 _index) external {
        require(
            msg.sender == talentList[_index].owner,
            "Only the owner can delete profile"
        );
        talentList[_index] = talentList[talentListLength - 1];
        delete talentList[talentListLength - 1];
        talentListLength--;
    }

    //Function to get total talent
    function getTalentListLength() public view returns (uint256) {
        return (talentListLength);
    }
}

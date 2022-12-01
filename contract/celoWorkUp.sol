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
    uint256 internal talentListLength;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Talent {
        address payable owner;
        string name;
        Experience experience;
        Profession profession;
        string description;
        string password;
        string date;
        uint256 price;
        uint256 hireCount;
    }

    mapping(uint256 => Talent) private talentList;

    mapping(address => bool) private registered;

    enum Experience {
        ENTRY,
        MID,
        SENIOR
    }

    enum Profession {
        FRONTEND,
        BACKEND,
        FULLSTACK
    }

    modifier onlyOwner(uint256 _index){
        require(
            msg.sender == talentList[_index].owner,
            "Only Owner can access this function"
        );
        _;
    }

    /**
        * @notice allow users to register as a talent
        * @dev Transaction reverts if the invalid input data is entered
        * @param _name Name of Talent
        * @param _experience Experience level of Talent
        * @param _profession Profession of Talent
        * @param _description Description of Talent/services provided
        * @param _password encrypted password of Talent
        * @param _date The registered date for Talent
        * @param _price Cost to hire talent

     */
    function registerTalent(
        string calldata _name,
        Experience _experience,
        Profession _profession,
        string calldata _description,
        string calldata _password,
        string calldata _date,
        uint256 _price
    ) external {
        require(!registered[msg.sender], "can't enroll twice");
        require(_experience == Experience.ENTRY ||_experience == Experience.MID || _experience == Experience.SENIOR);
        require(_profession == Profession.FRONTEND || _profession == Profession.BACKEND || _profession == Profession.FULLSTACK);
        require(bytes(_name).length > 0);
        require(bytes(_description).length > 0);
        require(bytes(_password).length > 0);
        require(bytes(_date).length > 0);

        // 1696 gas saved

        Talent storage currentTalent = talentList[talentListLength];
        currentTalent.owner = payable(msg.sender);
        currentTalent.name = _name;
        currentTalent.experience = _experience;
        currentTalent.profession = _profession;
        currentTalent.description = _description;
        currentTalent.password = _password;
        currentTalent.date = _date;
        currentTalent.price = _price;
        registered[msg.sender] = true;
        talentListLength++;
    }

    /**
        * @notice allow users to hire a talent
     */
    function hireTalent(uint256 _index) public payable {
        Talent storage currentTalent = talentList[_index];
        require(currentTalent.owner != msg.sender, "You can't hire yourself");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                currentTalent.owner,
                currentTalent.price
            ),
            "Transfer failed."
        );
        currentTalent.hireCount++;
    }

    function changePrice(uint256 _index, uint256 _price) external onlyOwner(_index){
        talentList[_index].price = _price;
    }

    /**
        * @dev deletes a Talent from the contract's state
        * @notice allow a talent to delete their profile
     */
    function deleteProfile(uint256 _index) external onlyOwner(_index){
        talentList[_index] = talentList[talentListLength - 1];
        delete talentList[talentListLength - 1];
        talentListLength--;
        registered[msg.sender] = false;
    }

    /// * @notice  Function to get all registed talent
    function getTalentList(uint256 _index)
        public
        view
        returns (
            Talent memory
        )
    {
        return talentList[_index];
    }


    //Function to get total talent
    function getTalentListLength() public view returns (uint256) {
        return (talentListLength);
    }
}

use starknet::{ContractAddress, get_caller_address};
use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn decimals(self: @TContractState) -> u8;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn transfer(ref self: TContractState, to: ContractAddress, amount: u256);
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256);
    fn transfer_from(ref self: TContractState, from: ContractAddress, to: ContractAddress, amount: u256);
}

#[starknet::contract]
pub mod MyToken {
    use super::*;

    #[storage]
    struct Storage {
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        let name: ByteArray = "MyToken1";
        let symbol: ByteArray = "MTK1";
        let decimals: u8 = 18;
        let initial_supply: u256 = 0;

        StoragePointerWriteAccess::write(self.name, name);
        StoragePointerWriteAccess::write(self.symbol, symbol);
        StoragePointerWriteAccess::write(self.decimals, decimals);
        StoragePointerWriteAccess::write(self.total_supply, initial_supply);
    }

    #[abi(embed_v0)]
    impl MyTokenImpl of IERC20<ContractState> {
        fn name(self: @ContractState) -> ByteArray { StoragePointerReadAccess::read(@self.name) }
        fn symbol(self: @ContractState) -> ByteArray { StoragePointerReadAccess::read(@self.symbol) }
        fn decimals(self: @ContractState) -> u8 { StoragePointerReadAccess::read(@self.decimals) }
        fn total_supply(self: @ContractState) -> u256 { StoragePointerReadAccess::read(@self.total_supply) }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            StorageMapReadAccess::read(self.balances, account)
        }

        fn transfer(ref self: ContractState, to: ContractAddress, amount: u256) {
            let sender = get_caller_address();
            let sender_balance = StorageMapReadAccess::read(self.balances, sender);
            assert!(sender_balance >= amount, "Insufficient balance");
            StorageMapWriteAccess::write(self.balances, sender, sender_balance - amount);

            let to_balance = StorageMapReadAccess::read(self.balances, to);
            StorageMapWriteAccess::write(self.balances, to, to_balance + amount);

            self.emit(Transfer { from: sender, to, value: amount });
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) {
            let owner = get_caller_address();
            StorageMapWriteAccess::write(self.allowances, (owner, spender), amount);

            self.emit(Approval { owner, spender, value: amount });
        }

        fn transfer_from(ref self: ContractState, from: ContractAddress, to: ContractAddress, amount: u256) {
            let spender = get_caller_address();
            let allowance = StorageMapReadAccess::read(self.allowances, (from, spender));
            assert!(allowance >= amount, "Allowance exceeded");
            StorageMapWriteAccess::write(self.allowances, (from, spender), allowance - amount);

            let from_balance = StorageMapReadAccess::read(self.balances, from);
            assert!(from_balance >= amount, "Insufficient balance");
            StorageMapWriteAccess::write(self.balances, from, from_balance - amount);

            let to_balance = StorageMapReadAccess::read(self.balances, to);
            StorageMapWriteAccess::write(self.balances, to, to_balance + amount);

            self.emit(Transfer { from, to, value: amount });
        }
    }

    #[starknet::interface]
    pub trait ITokenOwner<TContractState> { fn mint(ref self: TContractState, to: ContractAddress, amount: u256); }

    #[abi(embed_v0)]
    impl TokenOwnerImpl of ITokenOwner<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let new_total = StoragePointerReadAccess::read(@self.total_supply) + amount;
            StoragePointerWriteAccess::write(self.total_supply, new_total);

            let to_balance = StorageMapReadAccess::read(self.balances, to);
            StorageMapWriteAccess::write(self.balances, to, to_balance + amount);

            let zero: ContractAddress = 0x0.try_into().unwrap();
            self.emit(Transfer { from: zero, to, value: amount });
        }
    }
}

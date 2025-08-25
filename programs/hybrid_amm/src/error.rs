use anchor_lang::prelude::*;
use constant_product_curve::CurveError;

#[error_code]
pub enum AmmError {
    #[msg("This pool is locked")]
    PoolLocked,
    #[msg("Slippage exceeded")]
    SlippageExceded,
    #[msg("Invalid update authority")]
    InvalidAuthority,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Invalid precision")]
    InvalidPrecision,
    #[msg("Overflow")]
    Overflow,
    #[msg("Underflow")]
    Underflow,
    #[msg("Invalid fee")]
    InvalidFee,
    #[msg("Insufficient balance")]
    Insufficientbalance,
    #[msg("Zero balance")]
    ZeroBalance,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
}

impl From<CurveError> for AmmError {
    fn from(error: CurveError) -> AmmError {
        match error {
            CurveError::InvalidPrecision => AmmError::InvalidPrecision,
            CurveError::Overflow => AmmError::Overflow,
            CurveError::Underflow => AmmError::Underflow,
            CurveError::InvalidFeeAmount => AmmError::InvalidFee,
            CurveError::InsufficientBalance => AmmError::Insufficientbalance,
            CurveError::ZeroBalance => AmmError::ZeroBalance,
            CurveError::SlippageLimitExceeded => AmmError::SlippageExceded,
        }
    }
}
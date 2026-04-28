import React from 'react';
import TextField from '@mui/material/TextField';
import '../styles/PinInput.css';

const PinInput = ({ pin, setPin, error, disabled }) => {
    const handleChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 6) {
            setPin(value);
        }
    };

    return (
        <TextField
            className="textField pin-input"
            id="pin"
            label="6-Digit Security PIN"
            variant="filled"
            type="password"
            value={pin}
            onChange={handleChange}
            error={!!error}
            required
            disabled={disabled}
            fullWidth
            inputProps={{
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
            }}
        />
    );
};

export default PinInput;

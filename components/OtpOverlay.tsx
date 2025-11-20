import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type ViewAndTextStyle = ViewStyle & TextStyle;

interface OtpOverlayProps {
  onConfirm: (code: string) => void;
  onClose: () => void;
  mobileNo: string;
  onResend: () => void;
}

export default function OtpOverlay({ onConfirm, onClose, mobileNo, onResend }: OtpOverlayProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timer === 0 && !isResending) {
      setIsResending(true);
      await onResend(); 
      setIsResending(false);
      setTimer(30);
      Alert.alert('Success', 'New OTP sent!');
    }
  };

  const isOtpComplete = otp.every(digit => digit.length === 1);
  const resendDisabled = timer !== 0 || isResending;

  return (
    <View style={overlayStyles.fullScreenOverlay}>
      <View style={overlayStyles.otpBox}>
        <TouchableOpacity style={overlayStyles.closeButton} onPress={onClose}>
          <Text style={overlayStyles.closeText}>X</Text>
        </TouchableOpacity>
        <Text style={overlayStyles.enterOtpText}>ENTER 6-DIGIT OTP</Text>
        
        <View style={overlayStyles.otpInputContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              style={overlayStyles.otpInput as StyleProp<TextStyle>} 
              value={digit}
              onChangeText={(text) => handleOtpChange(text.slice(-1), index)}
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && digit === '' && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            overlayStyles.confirmButton,
            isOtpComplete ? overlayStyles.confirmButtonActive : overlayStyles.confirmButtonDisabled,
          ]}
          disabled={!isOtpComplete}
          onPress={() => onConfirm(otp.join(''))}>
          <Text style={overlayStyles.confirmButtonText}>CONFIRM</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleResendOtp} disabled={resendDisabled}>
          <Text style={[
            overlayStyles.resendText,
            resendDisabled && { opacity: 0.5 }
          ]}>
            {isResending ? 'SENDING...' : `RESEND OTP? ${timer > 0 ? `${timer}SEC` : 'RESEND'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface OverlayStyles {
  fullScreenOverlay: ViewStyle;
  otpBox: ViewStyle;
  closeButton: ViewStyle;
  closeText: TextStyle;
  enterOtpText: TextStyle;
  otpInputContainer: ViewStyle;
  otpInput: ViewAndTextStyle; 
  confirmButton: ViewStyle;
  confirmButtonDisabled: ViewStyle;
  confirmButtonActive: ViewStyle;
  confirmButtonText: TextStyle;
  resendText: TextStyle;
}

const overlayStyles = StyleSheet.create<OverlayStyles>({
  fullScreenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  otpBox: { width: '90%', maxWidth: 380, backgroundColor: '#333333', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#444444' },
  closeButton: { position: 'absolute', top: 15, right: 15, padding: 5 },
  closeText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  enterOtpText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20, marginTop: 10, letterSpacing: 1.5, borderBottomWidth: 2, borderColor: '#FFFFFF', paddingBottom: 5 },
  otpInputContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 25, gap: 8 },
  otpInput: { width: 40, height: 50, backgroundColor: '#151718', borderRadius: 8, borderWidth: 1, borderColor: '#555555', color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  confirmButton: { width: '80%', paddingVertical: 12, borderRadius: 30, marginBottom: 15 },
  confirmButtonDisabled: { backgroundColor: '#555555' },
  confirmButtonActive: { backgroundColor: '#388e3c' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  resendText: { color: '#FDD835', fontSize: 14, fontWeight: '500' },
});
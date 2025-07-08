import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  resetCode?: string;
}

export const ResetPasswordEmail = ({
  resetCode,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Eng4All Şifre Sıfırlama Kodunuz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Eng4All Şifre Sıfırlama</Heading>
        <Text style={text}>
          Merhaba,
        </Text>
        <Text style={text}>
          Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için lütfen aşağıdaki 6 haneli kodu kullanın:
        </Text>
        <Text style={codeStyle}>
          {resetCode}
        </Text>
        <Text style={text}>
          Bu kodu, şifre sıfırlama sayfasındaki ilgili alana girmeniz gerekmektedir. Kod 10 dakika boyunca geçerlidir.
        </Text>
        <Text style={text}>
          Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </Text>
        <Text style={text}>
          Teşekkürler,
          <br />
          Eng4All Ekibi
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #f0f0f0",
  borderRadius: "4px",
};

const h1 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "14px",
  margin: "24px 0",
  padding: "0 24px",
};

const codeStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#333",
  letterSpacing: "8px",
  backgroundColor: "#f0f0f0",
  padding: "12px",
  borderRadius: "4px",
  margin: "0 24px",
};

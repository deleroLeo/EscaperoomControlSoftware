import imaplib
import email
import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from pathlib import Path
import cv2
import base64

from email.header import decode_header

def mail_delete(username, password):
    # Imap klasse Generieren und Verbindung zum Gmail IMAP_Server herstellen
    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    # Einloggen
    imap.login(username, password)
    
    
    #Ordner "Alle Mails" auswählen
    #Ordner heißt je nach Gmail-Sprache anders habe deshalb christoph meiers default Sprache auf Englisch gestellt
    imap.select('"[Gmail]/Alle Nachrichten"')
    
    #Wählt alle Mails seit dem 24. November aus (Alle außer die von Mell)
    status, messages = imap.search(None, 'SINCE "03-MAR-2022"')
    messages = messages[0].split(b' ')
    
    
    #Für jede gefundene Mail
    for mail in messages:
        try:
            #hier holt er sich die Daten der Mail, also Inhalt und Betreff usw. 
            _, msg = imap.fetch(mail, "(RFC822)")
            # Schleife kann auch gelöscht werden, zeigt nur die zu löschenden Mails an
            for response in msg:
                if isinstance(response, tuple):
                    msg = email.message_from_bytes(response[1])
                    # decodiert den Betreff
                    subject = decode_header(msg["Subject"])[0][0]
                    if isinstance(subject, bytes):
                        #ändert den Datentyp zu String
                        subject = subject.decode()
                    print("Deleting", subject)
            #Verschiebt die Mail vom ALl-Mails Ordner in den Müll
            imap.store(mail,'+X-GM-LABELS', '\\Trash')
        except:
            pass
        
    #Löscht die Mail aus all mails
    while True:
        try:
            imap.expunge()
            imap.close()
            break
        except:
            print("Aborted")
    
    #Das ganze muss jetzt einfach nochmal gemacht werden um die Mails endgültig aus dem Papierkorb zu löschen
    #(Gmail is echt bisi überkompliziert :( xD)
      
    imap.select('"[Gmail]/Papierkorb"')
    status, messages = imap.search(None, 'SINCE "03-MAR-2021"')
    messages = messages[0].split(b' ')
    
    for mail in messages:
        try:        
            imap.store(mail, "+FLAGS", "\\Deleted")
        except:
            pass
    
    
    while True:
        try:
            imap.expunge()
            imap.close()
            break
        except:
            print("Aborted")
    
    # logout from the account
    imap.logout()
    
    
    
def send_mail(receiver_mail, sender_mail, password, subject, message, file_path = "", pic = False, adress = 0 ):
    print("starting the process worked!")
    email = receiver_mail
    #messageTemplate = readTemplate('nachricht.txt')
    
    
    ssl_context = ssl.create_default_context()
    s = smtplib.SMTP_SSL(host='smtp.gmail.com', port=465, context=ssl_context)
    s.login(sender_mail, password)

    
    msg = MIMEMultipart() 
    #message = messageTemplate.substitute()
    print(message)

    msg['From']=sender_mail
    msg['To']=email
    msg['Subject']= subject
    
    if pic == True:
        mimeBase = MIMEBase("image", "jpeg")
        mimeBase.set_payload(getPicture(adress))

        mimeBase.add_header('Content-Transfer-Encoding', 'base64')
        mimeBase['Content-Disposition'] = 'attachment; filename="Bild"'
    else:
        mimeBase = MIMEBase("application", "octet-stream")
        with open(file_path, "rb") as file:
            mimeBase.set_payload(file.read())

        encoders.encode_base64(mimeBase)
        mimeBase.add_header("Content-Disposition", f"attachment; filename={Path(file_path).name}")
    
    
    msg.attach(mimeBase)
    msg.attach(MIMEText(message, 'plain'))

    s.send_message(msg)
    del msg
		
    s.quit()
    
def getPicture(adress):
    capture = cv2.VideoCapture(adress)
    
    ret, frame = capture.read()
    ret, frame = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(frame)


                
    capture.release()
    cv2.destroyAllWindows()
    
    return (jpg_as_text)
    

def reset(receiver_mail, sender_mail, receiver_password, sender_password):
    mail_delete(receiver_mail, receiver_password)
    send_mail(receiver_mail, sender_mail, sender_password,
              "wie gewünscht :-)",
              "Hier wie besprochen nochmal die 09 ;) \n LG \n Meli ",
              "09.zip")


import ffmpeg
import json
import os


def getSettings():
    with open('settings.json', 'r') as file:
        data = json.load(file)
        return (data["ip-spycam"], data["ip-gamemastercam"])



def StartStream(ip, outputPath):
    
    try:
        #ipSpycam, ipGamemastercam = getSettings()
        inputStream = ffmpeg.input(ip)
        #inputAudio = ffmpeg.input("anullsrc")
        
        outputStream = ffmpeg.output(inputStream, outputPath, format='hls',fflags="flush_packets" , rtsp_transport="tcp" ,max_delay =5, start_number=0, hls_time=2, hls_segment_type ="mpegts", hls_flags = "delete_segments+append_list",  hls_list_size=10, vcodec ="copy")
        ffmpeg.run(outputStream)
    except:
        print("StreamAborted")
        pass


#StartStream("rtsp:/127.0.0.1:8554", "public/Controller/Stream1/output.m3u8")    
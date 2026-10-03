from preprocess import preprocess_text


text = "อยากเรียนการสร้างเกมด้วย Unity เพราะสนใจพัฒนาเกม"

result = preprocess_text(text)

print("ข้อความก่อนประมวลผล:")
print(text)

print("\nข้อความหลังประมวลผล:")
print(result)
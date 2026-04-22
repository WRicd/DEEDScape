import os
import pandas as pd
import numpy as np
import scipy.io as sio
import json
from datetime import datetime, time

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, time)):
            return obj.isoformat()
        return super(DateTimeEncoder, self).default(obj)

# ================= 1. 配置文件路径 =================
DATA_DIR = './data'
EEG_DIR = os.path.join(DATA_DIR, 'DreamEEG')


def process_data():
    print("正在读取 Excel 元数据...")
    df_emotional = pd.read_excel(os.path.join(DATA_DIR, 'Emotional.xlsx'))
    df_video = pd.read_excel(os.path.join(DATA_DIR, 'Video.xlsx'))

    df_metadata = pd.merge(df_emotional, df_video, on='Online_id', how='left')

    df_metadata = df_metadata.fillna("Unknown")

    print(f"正在提取 {EEG_DIR} 目录下的脑电波特征，这可能需要几十秒...")
    dreams_final_data = []

    # ================= 2. 提取脑电波特征并与元数据合并 =================
    for filename in os.listdir(EEG_DIR):
        if filename.endswith('.mat'):
            filepath = os.path.join(EEG_DIR, filename)
            try:
                subject_id = filename.split('_')[1]

                mat_data = sio.loadmat(filepath)
                keys = [k for k in mat_data.keys() if not k.startswith('__')]
                if not keys:
                    continue

                data_key = keys[0]
                signal_matrix = mat_data[data_key]

                intensity = float(np.var(signal_matrix, axis=1).mean())

                user_meta = df_metadata[df_metadata['Online_id'] == subject_id]

                if not user_meta.empty:
                    record = user_meta.iloc[0].to_dict()
                    record['EEG_Intensity'] = intensity
                    record['Filename'] = filename
                    dreams_final_data.append(record)

            except Exception as e:
                print(f"处理 {filename} 时跳过或出错: {e}")

    # ================= 3. 导出为前端可用的 JSON =================
    output_path = os.path.join(DATA_DIR, 'dream_data.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dreams_final_data, f, ensure_ascii=False, indent=2, cls=DateTimeEncoder)

    print(f"处理完成！共成功匹配并提取了 {len(dreams_final_data)} 个梦境数据。")
    print(f"JSON文件已保存至: {output_path}")


if __name__ == "__main__":
    process_data()
const $c = document.querySelector("#roulette");
const ctx = $c.getContext(`2d`);
const menuAdd = document.querySelector('#menuAdd');
const menuList = document.querySelector('#menuList tbody');
const product = [{ name: "돈토", weight: 50 }, { name: "윤스", weight: 50 }];
const colors = [];
let rotateInterval = null;
let stopRequested = false;
let angle = 0;
let currentSpeed = 0;

const generatePastelColor = () => {
    const r = Math.floor((Math.random() * 127) + 127);
    const g = Math.floor((Math.random() * 127) + 127);
    const b = Math.floor((Math.random() * 127) + 127);
    return `rgb(${r}, ${g}, ${b})`;
};

const updateMenuList = () => {
    menuList.innerHTML = '';
    product.forEach((item, index) => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        const weightCell = document.createElement('td');
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.value = item.weight;
        weightInput.addEventListener('change', () => {
            const newWeight = parseFloat(weightInput.value);
            if (isNaN(newWeight) || newWeight <= 0) {
                alert('비율은 숫자로 입력해야 합니다.');
                weightInput.value = item.weight;
                return;
            }
            item.weight = newWeight;
            newMake();
        });
        weightCell.appendChild(weightInput);
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', () => {
            product.splice(index, 1);
            updateMenuList();
            newMake();
        });
        actionCell.appendChild(deleteButton);
        row.appendChild(nameCell);
        row.appendChild(weightCell);
        row.appendChild(actionCell);
        menuList.appendChild(row);
    });
};

const newMake = () => {
    const [cw, ch] = [$c.width / 2, $c.height / 2];
    const totalWeight = product.reduce((sum, item) => sum + item.weight, 0);
    let startAngle = 0;

    if (colors.length === 0) {
        for (let i = 0; i < product.length; i++) {
            colors.push(generatePastelColor());
        }
    }

    ctx.clearRect(0, 0, $c.width, $c.height);

    product.forEach((item, i) => {
        const arc = (item.weight / totalWeight) * 2 * Math.PI;
        ctx.beginPath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.moveTo(cw, ch);
        ctx.arc(cw, ch, cw, startAngle, startAngle + arc);
        ctx.fill();
        ctx.closePath();
        startAngle += arc;
    });

    ctx.fillStyle = "#000";
    ctx.font = "18px Pretendard";
    ctx.textAlign = "center";
    startAngle = 0;

    product.forEach((item) => {
        const angle = startAngle + (item.weight / totalWeight) * Math.PI;
        ctx.save();
        ctx.translate(
            cw + Math.cos(angle) * (cw - 50),
            ch + Math.sin(angle) * (ch - 50)
        );
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(item.name, 0, 0);
        ctx.restore();
        startAngle += (item.weight / totalWeight) * 2 * Math.PI;
    });
};

const spin = () => {
    if (stopRequested && currentSpeed > 0) {
        currentSpeed -= 0.1;
    }

    if (currentSpeed <= 0) {
        clearInterval(rotateInterval);
        rotateInterval = null;
        return;
    }

    angle += currentSpeed;
    ctx.save();
    ctx.translate($c.width / 2, $c.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-$c.width / 2, -$c.height / 2);
    newMake();
    ctx.restore();
};

const rotate = () => {
    if (product.length <= 1) {
        alert('메뉴는 최소 2개 이상이어야 합니다.');
        return;
    }
    stopRequested = false;
    currentSpeed = 15;
    rotateInterval = setInterval(spin, 10);
    setTimeout(() => stopRotate(), 4000);
};

const stopRotate = () => {
    stopRequested = true;
};

const add = () => {
    if (menuAdd.value.trim()) {
        product.push({ name: menuAdd.value.trim(), weight: 50 });
        colors.length = 0;
        for (let i = 0; i < product.length; i++) {
            colors.push(generatePastelColor());
        }
        menuAdd.value = '';
        updateMenuList();
        newMake();
    } else {
        alert("메뉴를 입력한 후 버튼을 클릭 해 주세요");
    }
};

const resizeCanvas = () => {
    const containerWidth = document.getElementById('roulette-container').offsetWidth;
    const containerHeight = document.querySelector('.dynamic-row').offsetHeight;
    $c.width = containerWidth - 60; // padding 고려
    $c.height = Math.min(containerHeight - 60, containerWidth - 60);
    newMake();
};

menuAdd.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        add();
    }
});

window.addEventListener('resize', resizeCanvas);

updateMenuList();
resizeCanvas();
